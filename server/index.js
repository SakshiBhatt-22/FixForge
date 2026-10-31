import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import {publicScenarios} from './scenarios.js';
import {analyzeScenario} from './engine.js';
import {getAiExplanation} from './ai.js';
const app=express();app.use(cors({origin:['http://localhost:5173','http://127.0.0.1:5173']}));app.use(express.json({limit:'20kb'}));
app.get('/api/health',(_req,res)=>res.json({ok:true}));
app.get('/api/scenarios',(_req,res)=>res.json(publicScenarios));
app.post('/api/analyze',async(req,res)=>{
 const id=req.body?.scenarioId;
 if(typeof id!=='string') return res.status(400).json({error:'scenarioId is required'});
 const result=analyzeScenario(id);
 if(!result) return res.status(404).json({error:'Unknown scenario'});
 const ai=await getAiExplanation(result);
 res.json({...result,ai});
});
const port=Number(process.env.PORT||4000);
app.listen(port,()=>console.log(`API listening on http://localhost:${port}`));
