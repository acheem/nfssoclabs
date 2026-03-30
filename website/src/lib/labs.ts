export interface Lab {
  slug: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  points: number;
  description: string;
}

export const LABS: Lab[] = [
  {
    slug: "01-clipboard-theft",
    title: "Incident Response: Clipboard Data Theft",
    category: "IR / DFIR",
    difficulty: "Intermediate",
    points: 30,
    description: "Investigate a Windows clipboard data theft incident using memory and artifact analysis.",
  },
  {
    slug: "02-splunk-account-creation",
    title: "Splunk: Malicious Account Creation",
    category: "SIEM",
    difficulty: "Beginner",
    points: 20,
    description: "Use Splunk SPL to detect and investigate malicious account creation events.",
  },
  {
    slug: "03-fin7-threat-hunting",
    title: "FIN7 Threat Hunting with Splunk",
    category: "Threat Hunting",
    difficulty: "Advanced",
    points: 40,
    description: "Hunt for FIN7 TTPs using Splunk and MITRE ATT&CK framework.",
  },
  {
    slug: "04-packet-analysis",
    title: "Packet Analysis: Demonstrate Your Skills",
    category: "Network Forensics",
    difficulty: "Intermediate",
    points: 30,
    description: "Analyse network packet captures using Wireshark and tshark.",
  },
  {
    slug: "05-onenote-analysis",
    title: "Malicious OneNote Analysis",
    category: "Malware Analysis",
    difficulty: "Intermediate",
    points: 30,
    description: "Analyse malicious OneNote files to extract IOCs and attacker TTPs.",
  },
  {
    slug: "06-suspicious-email",
    title: "Incident Response: Suspicious Email",
    category: "IR / Phishing",
    difficulty: "Beginner",
    points: 20,
    description: "Investigate a phishing email and identify evidence of compromise.",
  },
];
