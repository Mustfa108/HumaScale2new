import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Assessment() {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/assessment/questions').then(res => setQuestions(res.data));
    }, []);

    const handleAnswer = (qId, val) => {
        setAnswers({ ...answers, [qId]: val });
    };

    const handleSubmit = async () => {
        const res = await api.post('/assessment/submit', { answers });
        navigate(`/report/${res.data.id}`);
    };

    if (questions.length === 0) return <p>جاري تحميل الأسئلة...</p>;

    return (
        <div style={{maxWidth: '600px', margin: '50px auto', textAlign: 'center'}}>
            <div style={{height: '10px', backgroundColor: '#e5e7eb', borderRadius: '5px', marginBottom: '20px'}}>
                <div style={{width: `${((currentIndex+1)/questions.length)*100}%`, height: '100%', backgroundColor: '#2563eb', transition: '0.3s'}}></div>
            </div>
            <h2>{questions[currentIndex].text}</h2>
            <div style={{display: 'flex', justifyContent: 'center', gap: '10px', margin: '30px 0'}}>
                {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => handleAnswer(questions[currentIndex].id, n)} 
                            style={{...styles.numBtn, backgroundColor: answers[questions[currentIndex].id] === n ? '#2563eb' : '#fff', color: answers[questions[currentIndex].id] === n ? '#fff' : '#000'}}>
                        {n}
                    </button>
                ))}
            </div>
            <div>
                <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(i => i - 1)}>السابق</button>
                {currentIndex === questions.length - 1 
                    ? <button onClick={handleSubmit} style={styles.nextBtn}>إرسال</button>
                    : <button onClick={() => setCurrentIndex(i => i + 1)} style={styles.nextBtn}>التالي</button>
                }
            </div>
        </div>
    );
}
const styles = {
    numBtn: { width: '50px', height: '50px', borderRadius: '50%', border: '1px solid #ddd', cursor: 'pointer' },
    nextBtn: { marginLeft: '20px', padding: '10px 25px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '5px', border: 'none' }
};