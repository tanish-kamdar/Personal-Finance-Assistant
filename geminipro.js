const { GoogleGenAI } =require("@google/genai");
const ai= new GoogleGenAI({ apiKey : 'AIzaSyCG14rw6pV3uHqgSpqa-XpQjOCAlmUJ5dk'});

async function aiRequest(prompt){
    const response= await ai.models.generateContent({
        model : 'gemini-2.0-flash',
        contents : prompt
    });
    return response.text;
}


module.exports= aiRequest;