export interface Lab {
  slug: string;
  title: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  points: number;
  description: string;
  tools: string[];
  mitre: string[];
  ctfScenario?: number;
}

export const LABS: Lab[] = [
  {
    slug: "01-clipboard-theft",
    title: "Incident Response: Clipboard Data Theft",
    category: "IR / DFIR",
    difficulty: "intermediate",
    points: 30,
    description: "Investigate a Windows clipboard data theft incident using memory and artifact analysis.",
    tools: ["Windows Artifacts", "Memory Analysis", "Volatility"],
    mitre: ["T1115"],
    ctfScenario: 1,
  },
  {
    slug: "02-splunk-account-creation",
    title: "Splunk: Malicious Account Creation",
    category: "SIEM",
    difficulty: "beginner",
    points: 20,
    description: "Use Splunk SPL to detect and investigate malicious account creation events.",
    tools: ["Splunk", "SPL"],
    mitre: ["T1136.001"],
    ctfScenario: 2,
  },
  {
    slug: "03-fin7-threat-hunting",
    title: "FIN7 Threat Hunting with Splunk",
    category: "Threat Hunting",
    difficulty: "advanced",
    points: 40,
    description: "Hunt for FIN7 TTPs using Splunk and MITRE ATT&CK framework.",
    tools: ["Splunk", "SPL", "MITRE ATT&CK"],
    mitre: ["T1059.001", "T1055", "T1078"],
    ctfScenario: 3,
  },
  {
    slug: "04-packet-analysis",
    title: "Packet Analysis: Demonstrate Your Skills",
    category: "Network Forensics",
    difficulty: "intermediate",
    points: 30,
    description: "Analyse network packet captures using Wireshark and tshark.",
    tools: ["Wireshark", "tshark"],
    mitre: ["T1040", "T1071"],
  },
  {
    slug: "05-onenote-analysis",
    title: "Malicious OneNote Analysis",
    category: "Malware Analysis",
    difficulty: "intermediate",
    points: 30,
    description: "Analyse malicious OneNote files to extract IOCs and attacker TTPs.",
    tools: ["OneNote", "oledump", "strings"],
    mitre: ["T1566.001", "T1059"],
  },
  {
    slug: "06-suspicious-email",
    title: "Incident Response: Suspicious Email",
    category: "IR / Phishing",
    difficulty: "beginner",
    points: 20,
    description: "Investigate a phishing email and identify evidence of compromise.",
    tools: ["Email Headers", "IOC Analysis"],
    mitre: ["T1566.001", "T1598"],
    ctfScenario: 6,
  },
  {
    slug: "07-windows-soc",
    title: "Windows SOC: Clipboard Banker Forensics",
    category: "Digital Forensics",
    difficulty: "intermediate",
    points: 30,
    description: "Use PowerShell forensic tools to investigate a clipboard-stealing banker trojan on NFC-WS-041. Trace process execution, C2 beaconing, and persistence mechanisms.",
    tools: ["PowerShell", "Windows Event Logs", "Sysmon"],
    mitre: ["T1115", "T1547.001", "T1053.005", "T1041"],
    ctfScenario: 7,
  },
  {
    slug: "08-linux-forensics",
    title: "Linux Server Forensics: SSH Compromise",
    category: "Digital Forensics",
    difficulty: "intermediate",
    points: 30,
    description: "Investigate a compromised Ubuntu production web server on NFC-SRV-WEB1. Identify the SSH brute-force entry, privilege escalation, malware dropper, and data exfiltration.",
    tools: ["bash", "Linux logs", "strings", "find"],
    mitre: ["T1110.001", "T1078", "T1548.003", "T1053.003", "T1505.003", "T1041"],
    ctfScenario: 8,
  },
  {
    slug: "09-kali-appsec",
    title: "Kali AppSec: Web Vulnerability Assessment",
    category: "AppSec / Pentesting",
    difficulty: "advanced",
    points: 100,
    description: "Use Kali Linux tools to find and exploit three vulnerabilities in the NFC Internal Portal: SQL Injection, Path Traversal, and Command Injection. Three flags to capture.",
    tools: ["Kali Linux", "curl", "SQLmap", "Burp Suite"],
    mitre: ["T1190", "T1083", "T1059"],
    ctfScenario: 9,
  },
];
