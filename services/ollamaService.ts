
import { ChatMessage } from "../types";

// Default to 127.0.0.1 which is more reliable than localhost on Windows/IPv6 setups
let OLLAMA_BASE_URL = localStorage.getItem('endo_ollama_url') || 'http://127.0.0.1:11434';
const MODEL = 'llama3';

export const setOllamaUrl = (url: string) => {
    let cleaned = url.trim();
    
    // Remove trailing slash
    if (cleaned.endsWith('/')) cleaned = cleaned.slice(0, -1);
    
    // Remove API paths if user pasted full endpoint
    if (cleaned.endsWith('/api/generate')) cleaned = cleaned.replace('/api/generate', '');
    if (cleaned.endsWith('/api/chat')) cleaned = cleaned.replace('/api/chat', '');
    
    // Auto-fix: Append port 11434 if no port is specified and it's not a standard http/https port assumption
    // Regex checks for :<digits> at the end of the string
    const hasPort = /:\d+$/.test(cleaned);
    if (!hasPort && !cleaned.startsWith('https://')) { // Don't append port to https (ngrok) by default unless explicit
        cleaned = `${cleaned}:11434`;
        console.log(`[System] Auto-appended port 11434. New URL: ${cleaned}`);
    }
    
    OLLAMA_BASE_URL = cleaned;
    localStorage.setItem('endo_ollama_url', OLLAMA_BASE_URL);
};

export const getOllamaUrl = () => OLLAMA_BASE_URL;

// --- MOCK FALLBACK SYSTEM ---
const generateMockResponse = (prompt: string, jsonMode: boolean): string => {
    console.warn("[System] Generating Mock Response due to API failure.");
    
    if (jsonMode) {
        if (prompt.includes("strategy") || prompt.includes("Simulate a military")) {
            return JSON.stringify({
                title: "Operation Silent Echo (Simulation)",
                summary: "Due to local AI unavailability, this is a pre-calculated simulation result. The operation focuses on stabilizing the northern sector using asymmetric drone tactics while securing key infrastructure.",
                adversary_analysis: {
                    profile: "Hybrid Insurgent Force",
                    perception_filter: "Opportunistic / Resource-Driven",
                    likely_response: "Dispersal into urban cover",
                    red_lines: ["Heavy Artillery Use", "Civilian Displacement > 10k"]
                },
                cross_domain_matrix: {
                    military_readiness: 85,
                    diplomatic_trust: 60,
                    economic_cost: 40,
                    domestic_morale: 75,
                    legal_compliance: 90
                },
                resource_impact: {
                    fuel_depletion: 12,
                    ammo_depletion: 8,
                    budget_burn: 15,
                    manpower_stress: 30
                },
                strategic_options: [
                    { id: "opt1", name: "Drone Swarm containment", description: "Deploy localized UAVs to track and hem in hostile movements.", deterrence_score: 75, cost_projection: "Low", civilian_risk: "Low", win_probability: 85 },
                    { id: "opt2", name: "Rapid Quick Reaction Force", description: "Heliborne assault on key stronghold.", deterrence_score: 90, cost_projection: "High", civilian_risk: "Medium", win_probability: 70 }
                ],
                rationale: "Option 1 provides the best balance of risk vs reward in the current political climate.",
                outcome_vector: "Stabilization within 48 hours"
            });
        }
        if (prompt.includes("risk assessments") || prompt.includes("knowledge")) {
            return JSON.stringify([
                { subject: "Border Security", A: 78, fullMark: 100 },
                { subject: "Cyber Resilience", A: 92, fullMark: 100 },
                { subject: "Supply Chain", A: 65, fullMark: 100 },
                { subject: "Civil Stability", A: 88, fullMark: 100 },
                { subject: "Climate Impact", A: 70, fullMark: 100 }
            ]);
        }
        if (prompt.includes("personnel risk") || prompt.includes("Student")) {
            return JSON.stringify({
                risk_level: "Medium",
                risk_score: 45,
                retention_forecast: [
                    { month: "Jan", rate: 95, risk_factor: "None" },
                    { month: "Feb", rate: 92, risk_factor: "Workload" },
                    { month: "Mar", rate: 88, risk_factor: "External Stress" }
                ],
                misconduct_risks: [
                    { id: "FLAG-01", risk_level: "Low", markers: ["Late Arrival"], probability: 15 }
                ],
                unit_health_summary: "Overall unit health is stable but showing signs of fatigue in 3rd platoon."
            });
        }
        if (prompt.includes("material")) {
            return JSON.stringify([
                { id: "MAT-X1", type: "Graphene-Composite", property: "Ballistic Resistance", score: 98, status: "Testing" },
                { id: "MAT-X2", type: "Titanium Alloy", property: "Heat Dissipation", score: 85, status: "Production" },
                { id: "MAT-X3", type: "Ceramic Matrix", property: "Weight Reduction", score: 92, status: "Prototyping" }
            ]);
        }
        if (prompt.includes("swarm")) {
            return JSON.stringify([
                "[SYSTEM] Swarm Protocol Initiated (Simulation Mode)",
                "[AGENT_1] Scanning sector 4...",
                "[AGENT_2] Logistics constraint identified at Bridge Alpha.",
                "[CMD_CORE] Rerouting convoy via Route B.",
                "[EXEC] Optimization complete. +15% Efficiency."
            ]);
        }
        // Default empty object for unknown JSON requests to prevent crashes
        return "{}";
    } else {
        // Text Mode Mock
        if (prompt.includes("briefing")) {
            return "TACTICAL BRIEFING (SIMULATED)\n\n1. SITUATION: Adversary forces entrenched in high ground. Weather is clear. Supply lines active.\n2. MISSION: Dislodge hostiles and secure key infrastructure.\n3. EXECUTION: Phase 1 Air Interdiction, followed by ground maneuver.\n4. LOGISTICS: Fuel and Ammo at 90%.\n5. COMMAND: Signals operative. Proceed on my mark.";
        }
        if (prompt.includes("report")) {
            return "REPORT: OPERATIONS SUMMARY\n\nDATE: 2024-10-24\nSTATUS: GREEN\n\nAll sectors report nominal status. Logistics throughput at 94%. Intelligence indicates reduced chatter in northern sector. Recommend maintaining current posture.";
        }
        return "System is operating in offline simulation mode. Connection to local AI core was not established. This data is generated for interface demonstration purposes.";
    }
};

// --- CORE OLLAMA FUNCTIONS ---

// Generic Generate (Non-Streaming)
async function queryOllama(prompt: string, system: string = "", jsonMode: boolean = false): Promise<string> {
    const url = `${OLLAMA_BASE_URL}/api/generate`;
    try {
        const controller = new AbortController();
        // Shortened timeout for quicker fallback to mock
        const timeoutId = setTimeout(() => controller.abort(), 5000); 

        console.log(`[Ollama] Sending request to ${url} (Model: ${MODEL})`);

        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true' // Bypasses Ngrok free tier warning page
            },
            mode: 'cors',
            credentials: 'omit', // Important for localhost CORS
            body: JSON.stringify({
                model: MODEL,
                prompt: prompt,
                system: system,
                stream: false,
                format: jsonMode ? 'json' : undefined,
                options: {
                    temperature: 0.7,
                    num_ctx: 4096
                }
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Ollama API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.response;
    } catch (e: any) {
        console.warn("Ollama Connection Failed, falling back to mock data.", e);
        return generateMockResponse(prompt, jsonMode);
    }
}

// Chat Stream (Using /api/chat which is better for conversation)
async function* streamOllamaChat(messages: {role: string, content: string}[], system?: string): AsyncGenerator<string, void, unknown> {
    const url = `${OLLAMA_BASE_URL}/api/chat`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        // Construct payload including system message if present
        const payloadMessages = system ? [{ role: 'system', content: system }, ...messages] : messages;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true' // Bypasses Ngrok free tier warning page
            },
            mode: 'cors',
            credentials: 'omit',
            body: JSON.stringify({
                model: MODEL,
                messages: payloadMessages,
                stream: true,
                options: {
                    temperature: 0.7,
                    num_ctx: 4096
                }
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId); // Clear initial connection timeout

        if (!response.ok) {
            // Fallback for stream
            yield "Error: Local AI Offline. Switching to Simulation Mode...\n\n";
            yield generateMockResponse(messages[messages.length-1].content, false);
            return;
        }

        if (!response.body) {
            yield "Error: No response body.";
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const json = JSON.parse(line);
                    // /api/chat returns 'message' object with 'content'
                    if (json.message && json.message.content) {
                        yield json.message.content;
                    }
                    if (json.done) return;
                } catch (e) { 
                    // ignore partial json
                }
            }
        }
    } catch (e: any) {
        console.warn("Ollama Stream Error, falling back to mock.", e);
        yield ":: SYSTEM NOTICE :: Local AI Connection Failed. Showing simulated response.\n\n";
        yield generateMockResponse(messages[messages.length-1].content, false);
    }
}

// Helper to clean JSON string
const cleanJson = (text: string): string => {
    if (!text) return "{}";
    let cleaned = text.trim();
    // Remove markdown code blocks
    cleaned = cleaned.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '');
    
    // Try to extract JSON object if surrounded by text
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');

    if (firstBrace !== -1 && lastBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    } else if (firstBracket !== -1 && lastBracket !== -1) {
        cleaned = cleaned.substring(firstBracket, lastBracket + 1);
    }
    return cleaned.trim();
};

// --- SLAS ASSISTANT ---

export async function* streamSLASResponse(
  prompt: string, 
  context: string, 
  history: ChatMessage[], 
  language: string, 
  image?: string
): AsyncGenerator<string, void, unknown> {
    
    // System Instruction
    const systemPrompt = `You are SLAS (Smart Leadership Assistant System) for the Ethiopian National Defence Force. 
    Current Context: ${context}. 
    User Language: ${language}. 
    Be tactical, concise, and authoritative. Provide military-grade analysis.`;

    // Convert App ChatMessage to Ollama Message Format
    const ollamaMessages = history.map(h => ({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.text
    }));

    // Add current user prompt
    let currentContent = prompt;
    if (image) {
        currentContent += "\n[SYSTEM: User attached an image. Simulate analysis of visual intel relative to context.]";
    }
    ollamaMessages.push({ role: 'user', content: currentContent });

    yield* streamOllamaChat(ollamaMessages, systemPrompt);
}

// --- GENERATION FUNCTIONS ---

export const generateSpeech = async (text: string, voice: string = 'Kore'): Promise<AudioBuffer | null> => {
    // Llama 3 is text-only. 
    return null;
};

export const runStrategySimulation = async (scenario: string, mode: string, language: string, params?: any): Promise<string> => {
    const system = "You are a Military Strategic AI. Output STRICT JSON only.";
    const prompt = `Simulate a military strategy.
    Scenario: ${scenario}
    Mode: ${mode} (Red Team vs Blue Team)
    Language: ${language}
    Params: ${JSON.stringify(params)}
    
    Return a JSON object with this exact schema:
    {
        "title": "Operation Name",
        "summary": "Executive summary",
        "adversary_analysis": {
            "profile": "Adversary Type",
            "perception_filter": "Their view",
            "likely_response": "Action",
            "red_lines": ["Line 1", "Line 2"]
        },
        "cross_domain_matrix": {
            "military_readiness": 0-10,
            "diplomatic_trust": 0-10,
            "economic_cost": 0-10,
            "domestic_morale": 0-10,
            "legal_compliance": 0-10
        },
        "resource_impact": {
            "fuel_depletion": 0-100,
            "ammo_depletion": 0-100,
            "budget_burn": 0-100,
            "manpower_stress": 0-100
        },
        "strategic_options": [
            { "id": "opt1", "name": "Name", "description": "Desc", "deterrence_score": 0-100, "cost_projection": "Low/Med/High", "civilian_risk": "Low/Med/High", "win_probability": 0-100 }
        ],
        "rationale": "Reasoning",
        "outcome_vector": "Prediction"
    }`;

    return await queryOllama(prompt, system, true);
};

export const runAdvancedSimulation = async (simType: string, params: any): Promise<string> => {
    const system = "You are a specialized Military Simulation AI. Output STRICT JSON only.";
    let prompt = "";

    switch (simType) {
        case 'knowledge':
            prompt = `Generate a JSON array of risk assessments for region ${params.region}. 
            Schema: [{"subject": "Topic", "A": number (0-100), "fullMark": 100}]`;
            break;
        case 'swarm':
            prompt = `Simulate a military AI swarm log for ${params.objective}. 
            Return a JSON array of strings, e.g. ["[AGENT] Message..."].`;
            break;
        case 'defense_echo':
            prompt = `Predict policy impact for: ${params.policy}. 
            Return JSON array: [{"t": "T+0", "stability": number, "cost": number}, ...]`;
            break;
        case 'threat_echo':
            prompt = `Simulate disinformation clusters for ${params.topic}.
            Return JSON array: [{"x": number, "y": number, "z": number, "name": "Cluster Name"}]`;
            break;
        case 'material':
            prompt = `Generate hypothetical material candidates for ${params.goal}.
            Return JSON array: [{"id": "MAT-X", "type": "Type", "property": "Prop", "score": number, "status": "Status"}]`;
            break;
        default:
            prompt = `Simulate ${simType} with params ${JSON.stringify(params)}. Return JSON.`;
    }

    const res = await queryOllama(prompt, system, true);
    return cleanJson(res);
};

export const analyzePersonnelRisk = async (unit: string, metrics: any): Promise<any> => {
    const prompt = `Analyze personnel risk for ${unit} based on: ${JSON.stringify(metrics)}.
    Return JSON: {
        "risk_level": "Low/Med/High",
        "risk_score": 0-100,
        "retention_forecast": [{"month": "M1", "rate": 0-100, "risk_factor": "Reason"}],
        "misconduct_risks": [{"id": "ID", "risk_level": "Lvl", "markers": ["m1"], "probability": 0-100}],
        "unit_health_summary": "Summary"
    }`;
    const res = await queryOllama(prompt, "You are an HR Analytics AI. JSON Only.", true);
    return JSON.parse(cleanJson(res));
};

export const generateReport = async (type: string, language: string): Promise<string> => {
    return await queryOllama(`Generate a professional military report for ${type} in ${language}. Include Header, Status, and Recommendations.`, "You are a Military Aide.");
};

export const analyzeFieldInsight = async (insight: string, language: string, audioBase64?: string): Promise<string> => {
    return await queryOllama(`Analyze this field report: "${insight}". Provide Triage Priority (High/Med/Low), Category, and Recommended Action.`, "You are an Intelligence Officer.");
};

export const searchIntelligence = async (query: string, location?: {lat: number, lng: number}): Promise<{text: string, sources: any[]}> => {
    const locStr = location ? `at ${location.lat}, ${location.lng}` : "";
    const prompt = `Simulate an intelligence search result for "${query}" ${locStr}. 
    Provide a concise summary of hypothetical recent events or data points relevant to a defense context.`;
    
    const text = await queryOllama(prompt, "You are an Intelligence Analyst. Provide realistic simulated intel.");
    
    return {
        text,
        sources: [
            { web: { title: "Internal Intel Database", uri: "secure://db-core" } },
            { web: { title: "Intercepted Comms", uri: "secure://sigint-logs" } }
        ]
    };
};

export const runTerminalCommand = async (command: string): Promise<string> => {
    return await queryOllama(`Simulate the terminal output for the command: "${command}". Be technical and brief.`, "You are a Linux Terminal.");
};

export const parseDataEntry = async (input: string, context: string): Promise<any> => {
    const prompt = `Extract structured data from "${input}" for a form in context: ${context}.
    Return JSON key-value pairs matching typical military form fields (e.g., unit_id, quantity, status, location).`;
    const res = await queryOllama(prompt, "JSON Extractor", true);
    return JSON.parse(cleanJson(res));
};

export const generateDynamicData = async (prompt: string, schema: string): Promise<any> => {
    const fullPrompt = `${prompt}
    Return STRICT JSON using this schema: ${schema}`;
    const res = await queryOllama(fullPrompt, "Data Generator. JSON Only.", true);
    try {
        return JSON.parse(cleanJson(res));
    } catch (e) {
        return [];
    }
};

export const getStrategicForecast = async (language: string) => {
    return await queryOllama(`Provide a short strategic forecast for the Horn of Africa region for the next 24 hours. Language: ${language}.`, "Military Strategist");
};

export const generateExamQuestion = async (subject: string, difficulty: string): Promise<any> => {
    const prompt = `Generate a ${difficulty} multiple-choice question about ${subject} for military cadets.
    Return JSON: {"question": "text", "options": ["A", "B", "C", "D"], "correct_index": 0-3, "explanation": "text"}`;
    const res = await queryOllama(prompt, "Exam Creator. JSON Only.", true);
    return JSON.parse(cleanJson(res));
};

export const evaluateApplicant = async (profile: any): Promise<any> => {
    const prompt = `Evaluate military applicant: ${JSON.stringify(profile)}.
    Return JSON: {"fit_score": 0-100, "recommendation": "text", "strengths": ["a","b"], "risks": ["c","d"]}`;
    const res = await queryOllama(prompt, "Recruitment Officer. JSON Only.", true);
    return JSON.parse(cleanJson(res));
};

export const generateCourseRecommendations = async (topic: string, level: string): Promise<any[]> => {
    const prompt = `Suggest 3 training courses for ${topic} at ${level} level.
    Return JSON Array: [{"title": "Name", "duration": "Time", "module": "Type", "reason": "Why"}]`;
    const res = await queryOllama(prompt, "Training Advisor. JSON Only.", true);
    return JSON.parse(cleanJson(res));
};

export const draftSRSCommunication = async (recipient: string, context: string, tone: string): Promise<string> => {
    return await queryOllama(`Draft a message to ${recipient} about ${context}. Tone: ${tone}.`, "Communication Aide");
};

export const analyzeSatelliteTarget = async (coords: string, name: string, language: string): Promise<string> => {
    return await queryOllama(`Analyze satellite imagery target: ${name} at ${coords}. Describe potential military significance and status.`, "IMINT Analyst");
};

export const analyzeSatelliteRecon = async (image: string, mime: string, context: string): Promise<any> => {
    const prompt = `Simulate an analysis of a satellite reconnaissance image for context: ${context}.
    Assume standard military targets.
    Return JSON: {
        "strategic_value": "High/Med/Low",
        "threat_assessment": "Desc",
        "terrain_analysis": "Desc",
        "tactical_recommendation": "Action",
        "assets_detected": [{"type": "Tank/Truck/Plane", "count": number, "confidence": 0-100}]
    }`;
    const res = await queryOllama(prompt, "IMINT AI. JSON Only.", true);
    return JSON.parse(cleanJson(res));
};

export const generatePressRelease = async (topic: string, tone: string, language: string): Promise<string> => {
    return await queryOllama(`Write a military press release. Topic: ${topic}. Tone: ${tone}. Language: ${language}.`, "Public Relations Officer");
};

export const generateRadioChatter = async (): Promise<any[]> => {
    const prompt = `Generate 5 lines of realistic military radio chatter (tactical, brief).
    Return JSON Array: [{"org": "Callsign", "trans": "Message"}]`;
    const res = await queryOllama(prompt, "Radio Operator. JSON Only.", true);
    return JSON.parse(cleanJson(res));
};

export const analyzeCombatAudio = async (base64: string, mime: string): Promise<any> => {
    const prompt = `Simulate analysis of a battlefield audio recording.
    Return JSON: {
        "voice_stress_level": "Low/Med/High/Panic",
        "keywords_detected": ["Contact", "Ammo", "Medic"],
        "environment_sounds": ["Gunfire", "Explosion", "Wind"],
        "summary": "Brief situation report"
    }`;
    const res = await queryOllama(prompt, "Audio Analyst. JSON Only.", true);
    return JSON.parse(cleanJson(res));
};

export const runPsychometricAnalysis = async (answers: any): Promise<any> => {
    const prompt = `Analyze these psychometric answers: ${JSON.stringify(answers)}.
    Return JSON: {
        "scores": {"iq": number, "eq": number, "sq": number, "aq": number},
        "analysis": {"summary": "text", "strengths": ["a"], "limitations": ["b"]},
        "traits": [{"trait": "Name", "score": 0-100, "desc": "text"}]
    }`;
    const res = await queryOllama(prompt, "Psychologist. JSON Only.", true);
    return JSON.parse(cleanJson(res));
};

export const recommendStrategy = async (situation: string, domain: string, enemy: string): Promise<any> => {
    const prompt = `Recommend military strategy. Situation: ${situation}. Domain: ${domain}. Enemy: ${enemy}.
    Return JSON: {
        "recommended_strategy": "Name",
        "rationale": "Reason",
        "principle_application": [{"principle": "Principle Name", "application": "How to apply"}],
        "operational_approach": [{"phase": "1", "action": "Step"}]
    }`;
    const res = await queryOllama(prompt, "Strategist. JSON Only.", true);
    return JSON.parse(cleanJson(res));
};

export const expandSimulationDetail = async (scenario: string, label: string, type: string, mode: string): Promise<string> => {
    return await queryOllama(`Expand details on ${type} "${label}" for scenario "${scenario}" in ${mode} mode. Be specific and technical.`, "Simulation Engine");
};

export const generateScenarioBriefing = async (terrain: string, weather: string, enemy: string, language: string): Promise<string> => {
    return await queryOllama(`Generate a tactical mission briefing. Terrain: ${terrain}. Weather: ${weather}. Enemy: ${enemy}. Language: ${language}.`, "Commander");
};

export const generateAAR = async (blue: number, red: number, turns: number, terrain: string): Promise<string> => {
    return await queryOllama(`Generate an After Action Report (AAR). Blue Strength: ${blue}%. Red Strength: ${red}%. Turns: ${turns}. Terrain: ${terrain}. Analyze outcome.`, "Evaluator");
};

export const analyzeStudentRisk = async (studentData: any): Promise<any> => {
    return analyzePersonnelRisk("Student", studentData);
};

export const generateInterventionPlan = async (name: string, weakness: string, context: any): Promise<any> => {
    const prompt = `Create intervention plan for student ${name} struggling with ${weakness}.
    Return JSON: {"plan_title": "Title", "objective": "Obj", "duration": "Time", "steps": [{"week": 1, "activity": "Act", "resource": "Res"}], "success_metric": "Metric"}`;
    const res = await queryOllama(prompt, "Education Expert. JSON Only.", true);
    return JSON.parse(cleanJson(res));
};

export const generateCurriculumGapAnalysis = async (grades: any): Promise<any> => {
    const prompt = `Analyze curriculum gaps based on grades: ${JSON.stringify(grades)}.
    Return JSON: {"identified_gaps": [{"topic": "T", "failure_rate": %, "probable_cause": "Reason"}], "recommendations": ["Rec1"]}`;
    const res = await queryOllama(prompt, "Curriculum Developer. JSON Only.", true);
    return JSON.parse(cleanJson(res));
};
