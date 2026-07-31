import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export default function Report() {
    const { id } = useParams();
    const [data, setData] = useState(null);

    useEffect(() => {
        api.get(`/assessment/${id}/results`).then(res => setData(res.data));
    }, [id]);

    if (!data) return <p>جاري تحليل النتائج بالذكاء الاصطناعي...</p>;

    return (
        <div style={{padding: '40px'}}>
            <h1>تقرير الجاهزية الرقمية</h1>
            <div style={{display: 'flex', gap: '40px', marginTop: '30px'}}>
                <div style={{flex: 1, backgroundColor: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
                    <ResponsiveContainer width="100%" height={400}>
                        <RadarChart data={data.chart_data}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="pillar" />
                            <Radar dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div style={{flex: 1, backgroundColor: '#eff6ff', padding: '25px', borderRadius: '15px'}}>
                    <h3 style={{color: '#1e40af'}}>تحليل الـ AI (NLG):</h3>
                    <p style={{fontStyle: 'italic', lineHeight: '1.6'}}>"{data.ai_summary}"</p>
                </div>
            </div>
            
            <h2 style={{marginTop: '40px'}}>خطة العمل الموجهة (Action Plan)</h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px'}}>
                {data.action_plan.map((phase, i) => (
                    <div key={i} style={{padding: '20px', borderTop: '4px solid #2563eb', backgroundColor: '#fff', borderRadius: '10px'}}>
                        <h4>{phase.title}</h4>
                        <ul style={{fontSize: '14px', color: '#555'}}>
                            {phase.tasks.map((task, j) => <li key={j}>{task}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}