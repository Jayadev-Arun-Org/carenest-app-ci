import os
import smtplib
import json
import socket
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Monkey-patch socket to force IPv4 resolution
# This fixes "Network is unreachable" when the cluster has no IPv6 route to smtp.gmail.com
_orig_getaddrinfo = socket.getaddrinfo
def _getaddrinfo_ipv4(host, port, family=0, type=0, proto=0, flags=0):
    return _orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = _getaddrinfo_ipv4

from azure.identity import DefaultAzureCredential
from azure.monitor.query import LogsQueryClient
from openai import OpenAI
import datetime

# Configuration
WORKSPACE_ID = os.environ.get("LOG_ANALYTICS_WORKSPACE_ID")
SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USERNAME = os.environ.get("SMTP_USERNAME")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
ALERT_EMAIL_TO = os.environ.get("ALERT_EMAIL_TO", "jayadevarun03@gmail.com")

def query_aks_metrics():
    print("Querying Azure Log Analytics...")
    if not WORKSPACE_ID:
        print("Missing LOG_ANALYTICS_WORKSPACE_ID")
        return None
        
    try:
        credential = DefaultAzureCredential()
        client = LogsQueryClient(credential)
        
        # Query Perf for CPU and Memory from the last 15 mins (AKS Container Insights)
        query = """
        Perf
        | where TimeGenerated > ago(15m)
        | where ObjectName == 'K8SNode' and (CounterName == 'cpuUsageNanoCores' or CounterName == 'cpuCapacityNanoCores' or CounterName == 'memoryWorkingSetBytes' or CounterName == 'memoryCapacityBytes')
        | summarize Average=avg(CounterValue) by Computer, ObjectName, CounterName
        """
        response = client.query_workspace(workspace_id=WORKSPACE_ID, query=query, timespan=datetime.timedelta(minutes=15))
        
        if response.status == "Failure":
            print("Query failed")
            return None
        
        results = []
        for table in response.tables:
            for row in table.rows:
                results.append(dict(zip(table.columns, row)))
        
        return results
    except Exception as e:
        print(f"Error querying metrics: {e}")
        return None

def analyze_with_llm(metrics_data):
    print("Analyzing metrics with LLM...")
    if not metrics_data:
        metrics_data = "No metric data returned."
        
    prompt = f"""
You are an expert Site Reliability Engineer (SRE) monitoring an Azure Kubernetes Service (AKS) cluster.
Your job is to analyze the following metrics from the last 15 minutes and determine if an alert should be sent.

Metrics Data:
{json.dumps(metrics_data, indent=2)}

Rules:
1. CPU Usage % = (cpuUsageNanoCores / cpuCapacityNanoCores) * 100. If this is consistently near or above 80% for any node, that is an anomaly.
2. Memory Usage % = (memoryWorkingSetBytes / memoryCapacityBytes) * 100. If this is consistently near or above 80% for any node, that is an anomaly.
3. If data is missing, state that it's healthy for now but flag missing data.

Output exactly a JSON object with the following schema:
{{
    "alert_required": boolean,
    "severity": "High" | "Medium" | "Low" | "None",
    "analysis": "Detailed explanation of your findings",
    "recommendation": "What should the ops team do?"
}}
"""
    try:
        from langfuse.openai import AzureOpenAI as LangfuseAzureOpenAI
        
        # Pull Azure endpoint from environment variable if available, else hardcode the one from terraform
        azure_endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT", "https://jd-carenest-new-openai.openai.azure.com/")
        
        lf_client = LangfuseAzureOpenAI(
            api_key=os.environ.get("OPENAI_API_KEY"),
            api_version="2024-02-01",
            azure_endpoint=azure_endpoint
        )
        
        response = lf_client.chat.completions.create(
            name="aks-metrics-analysis",
            model="gpt-4o", # Model deployment name in Azure OpenAI is typically gpt-4o
            messages=[
                {"role": "system", "content": "You are a helpful AIOps agent."},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" },
            temperature=0.2
        )
        
        result_json = response.choices[0].message.content
        return json.loads(result_json)
    except Exception as e:
        print(f"LLM Analysis failed: {e}")
        return None

def send_alert_email(analysis_result):
    print("Sending alert email...")
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = ALERT_EMAIL_TO
        msg['Subject'] = f"AIOps Alert: {analysis_result['severity']} Severity Incident"
        
        body = f"""
        <h2>AIOps Cluster Alert</h2>
        <p><strong>Severity:</strong> {analysis_result['severity']}</p>
        <p><strong>Analysis:</strong><br/>{analysis_result['analysis']}</p>
        <p><strong>Recommendation:</strong><br/>{analysis_result['recommendation']}</p>
        <br/>
        <p><em>Generated by Langfuse-traced AIOps Agent</em></p>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        # Revert to port 587 and starttls(), keeping the IPv4 patch
        server = smtplib.SMTP(SMTP_SERVER, int(os.environ.get('SMTP_PORT', 587)))
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(SMTP_USERNAME, ALERT_EMAIL_TO, text)
        server.quit()
        print("Email sent successfully!")
    except Exception as e:
        print(f"Failed to send email: {e}")

def main():
    print("Starting AIOps Agent Check...")
    metrics = query_aks_metrics()
    
    if metrics is not None:
        analysis = analyze_with_llm(metrics)
        if analysis:
            print("Analysis Result:")
            print(json.dumps(analysis, indent=2))
            
            if analysis.get("alert_required"):
                print("Alert condition met! Triggering email...")
                send_alert_email(analysis)
            else:
                print("Cluster is healthy. No alert required.")
        else:
            print("Failed to get analysis from LLM.")
    else:
         print("Failed to fetch metrics.")

if __name__ == "__main__":
    main()
