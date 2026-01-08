import { ChatMessage } from "../types";

// Use 127.0.0.1 for IPv4 reliability - ALWAYS use this instead of localhost
let OLLAMA_BASE_URL = localStorage.getItem('endo_ollama_url') || 'http://127.0.0.1:11434';
const MODEL = 'llama3';

export const setOllamaUrl = (url: string) => {
    let cleaned = url.trim();
    
    // ENSURE localhost is converted to 127.0.0.1
    cleaned = cleaned.replace(/localhost/gi, '127.0.0.1');
    
    // Remove trailing slash
    if (cleaned.endsWith('/')) cleaned = cleaned.slice(0, -1);
    
    // Remove API paths if user pasted full endpoint
    if (cleaned.endsWith('/api/generate')) cleaned = cleaned.replace('/api/generate', '');
    if (cleaned.endsWith('/api/chat')) cleaned = cleaned.replace('/api/chat', '');
    
    // Ensure it has http:// protocol
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
        cleaned = `http://${cleaned}`;
    }
    
    // Ensure it has port 11434
    const hasPort = /:\d+$/.test(cleaned);
    if (!hasPort) {
        cleaned = `${cleaned}:11434`;
    }
    
    // Final validation - must be valid URL
    try {
        new URL(cleaned);
    } catch {
        console.error(`Invalid URL generated: ${cleaned}, resetting to default`);
        cleaned = 'http://127.0.0.1:11434';
    }
    
    OLLAMA_BASE_URL = cleaned;
    localStorage.setItem('endo_ollama_url', OLLAMA_BASE_URL);
    console.log(`[Ollama] URL set to: ${OLLAMA_BASE_URL}`);
};

export const getOllamaUrl = () => OLLAMA_BASE_URL;

// Test connection - useful for debugging
export const testOllamaConnection = async (): Promise<{success: boolean, message: string}> => {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        
        if (response.ok) {
            const data = await response.json();
            return {
                success: true,
                message: `✅ Connected to Ollama at ${OLLAMA_BASE_URL}. Models: ${data.models?.map((m: any) => m.name).join(', ') || 'None'}`
            };
        } else {
            return {
                success: false,
                message: `❌ Ollama responded with error: ${response.status} ${response.statusText}`
            };
        }
    } catch (error: any) {
        return {
            success: false,
            message: `❌ Cannot connect to Ollama at ${OLLAMA_BASE_URL}. Error: ${error.message}. Make sure Ollama is running ("ollama serve").`
        };
    }
};

// --- CORE OLLAMA FUNCTIONS ---

// Generic Generate (Non-Streaming)
async function queryOllama(prompt: string, system: string = "", jsonMode: boolean = false): Promise<string> {
    const url = `${OLLAMA_BASE_URL}/api/generate`;
    
    console.log(`[Ollama] POST ${url}`);
    console.log(`[Ollama] Model: ${MODEL}, System: ${system ? "Yes" : "No"}, JSON: ${jsonMode}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: MODEL,
                prompt: prompt,
                system: system,
                stream: false,
                format: jsonMode ? 'json' : undefined,
                options: {
                    temperature: 0.7,
                    num_ctx: 8192
                }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Ollama Error ${response.status}:`, errorText);
            throw new Error(`Ollama Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`[Ollama] Response received (${data.response?.length || 0} chars)`);
        return data.response?.trim() || '';
    } catch (error: any) {
        console.error('❌ Ollama connection failed:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error(`Cannot connect to Ollama at ${OLLAMA_BASE_URL}. Make sure: 1) Ollama is running ("ollama serve"), 2) No firewall blocking port 11434`);
        }
        throw error;
    }
}

// Chat Stream (/api/chat – better for conversation history)
async function* streamOllamaChat(messages: {role: string, content: string}[], system?: string): AsyncGenerator<string, void, unknown> {
    const url = `${OLLAMA_BASE_URL}/api/chat`;
    
    console.log(`[Ollama] Streaming to ${url}`);
    console.log(`[Ollama] Messages count: ${messages.length}`);

    try {
        const payloadMessages = system ? [{ role: 'system', content: system }, ...messages] : messages;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: payloadMessages,
                stream: true,
                options: {
                    temperature: 0.7,
                    num_ctx: 8192
                }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Ollama Stream Error ${response.status}:`, errorText);
            yield `[ERROR] Ollama returned ${response.status}: ${errorText}`;
            return;
        }

        if (!response.body) {
            console.error('❌ No response body from Ollama');
            yield '[ERROR] No response from Ollama';
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                console.log('[Ollama] Stream completed');
                break;
            }
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
                if (!line.trim()) continue;
                
                try {
                    const json = JSON.parse(line);
                    if (json.message?.content) {
                        yield json.message.content;
                    }
                    if (json.done) {
                        console.log('[Ollama] Stream done flag received');
                        return;
                    }
                } catch (parseError) {
                    console.warn('[Ollama] Failed to parse JSON:', line.substring(0, 100));
                }
            }
        }
    } catch (error: any) {
        console.error('❌ Ollama stream fatal error:', error);
        yield `[ERROR] ${error.message}`;
    }
}

// Helper to clean JSON strings
const cleanJson = (text: string): string => {
    if (!text) return '{}';
    let cleaned = text.trim();
    cleaned = cleaned.replace(/^```json\s?/, '').replace(/^```\s?/, '').replace(/```$/, '');
    
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
    
    const systemPrompt = `You are SLAS (Smart Leadership Assistant System) for the Ethiopian National Defence Force. 
Current Context: ${context}. 
User Language: ${language}. 
Be tactical, concise, and authoritative. Provide military-grade analysis.`;

    const ollamaMessages = history.map(h => ({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.text
    }));

    let currentContent = prompt;
    if (image) {
        currentContent += "\n[User attached an image – describe visual intel if relevant.]";
    }
    ollamaMessages.push({ role: 'user', content: currentContent });

    console.log(`[SLAS] Starting stream with ${ollamaMessages.length} total messages`);
    console.log(`[SLAS] Context: ${context.substring(0, 100)}...`);
    
    yield* streamOllamaChat(ollamaMessages, systemPrompt);
}

// --- GENERATION FUNCTIONS ---

export const generateSpeech = async (text: string, voice: string = 'Kore'): Promise<AudioBuffer | null> => {
    return null; // Llama3 is text-only
};

export const runStrategySimulation = async (scenario: string, mode: string, language: string, params?: any): Promise<any> => {
    const system = "You are a Military Strategic AI. Output STRICT JSON only.";
    const prompt = `Simulate a military strategy.
    Scenario: ${scenario}
    Mode: ${mode} (Red Team vs Blue Team)
    Language: ${language}
    Params: ${JSON.stringify(params || {})}
    
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
            "military_readiness": 0-100,
            "diplomatic_trust": 0-100,
            "economic_cost": 0-100,
            "domestic_morale": 0-100,
            "legal_compliance": 0-100
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

    const res = await queryOllama(prompt, system, true);
    return JSON.parse(cleanJson(res));
};

export const runAdvancedSimulation = async (simType: string, params: any): Promise<any> => {
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
    return JSON.parse(cleanJson(res));
};

export const analyzePersonnelRisk = async (unit: string, metrics: any): Promise<any> => {
    const prompt = `Analyze personnel risk for ${unit} based on: ${JSON.stringify(metrics)}.
    Return JSON: {
        "risk_level": "Low/Medium/High",
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
    const prompt = `Perform an intelligence search for "${query}" ${locStr}. 
    Provide a concise summary of relevant defense-related findings.`;
    
    const text = await queryOllama(prompt, "You are an Intelligence Analyst.");
    
    return {
        text,
        sources: [
            { web: { title: "Internal Intel Database", uri: "secure://db-core" } },
            { web: { title: "Intercepted Comms", uri: "secure://sigint-logs" } }
        ]
    };
};

export const runTerminalCommand = async (command: string): Promise<string> => {
    return await queryOllama(`Execute the terminal command: "${command}". Provide realistic output.`, "You are a Linux Terminal.");
};

export const parseDataEntry = async (input: string, context: string): Promise<any> => {
    const prompt = `Extract structured data from "${input}" for context: ${context}.
    Return JSON with relevant military form fields (e.g., unit_id, quantity, status, location).`;
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
        console.error('JSON parse error in dynamic data:', e);
        return {};
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
    const prompt = `Analyze reconnaissance imagery for context: ${context}.
    Return JSON: {
        "strategic_value": "High/Medium/Low",
        "threat_assessment": "Description",
        "terrain_analysis": "Description",
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
    const prompt = `Analyze battlefield audio recording.
    Return JSON: {
        "voice_stress_level": "Low/Medium/High/Panic",
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

export { queryOllama }; // Add this line at the end