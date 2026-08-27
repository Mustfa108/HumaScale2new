import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { assessmentApi } from '../../api/assessment';
import { useToast } from '../../contexts/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageContainer, PageHeader } from '../../components/layout/Navbar';
import { Card, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { QuestionCard } from '../../components/assessment/QuestionCard';
import { AssessmentProgress } from '../../components/assessment/AssessmentProgress';
import { useLanguage } from '../../contexts/LanguageContext';
import { pickLocale } from '../../utils/locale';

export default function Assessment() {
  const { locale, t } = useLanguage();
  useDocumentTitle(t('assessment.title'));
  const navigate = useNavigate();
  const toast = useToast();

  const { data: questionsData, loading, error, refresh } = useAsync(
    () => assessmentApi.getQuestions(),
    { deps: [] },
  );

  // Flatten questions across pillars (preserving pillar meta for UI grouping)
  const allQuestions = useMemo(() => {
    if (!questionsData?.pillars) return [];
    const result = [];
    questionsData.pillars.forEach((p) => {
      (p.questions || []).forEach((q) => {
        result.push({
          ...q,
          pillar_id: p.id,
          pillar_name: pickLocale(p, 'name', locale),
          text: pickLocale(q, 'text', locale),
        });
      });
    });
    return result;
  }, [questionsData, locale]);

  // Answers: { [question_id]: score }
  const [answers, setAnswers] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [assessmentId, setAssessmentId] = useState(null);

  // Create a new assessment (or reuse existing in_progress) the first time we
  // have the questions loaded.
  useEffect(() => {
    if (!questionsData || assessmentId) return;
    let cancelled = false;
    async function bootstrap() {
      try {
        const res = await assessmentApi.start();
        if (!cancelled) {
          setAssessmentId(res.data?.assessment_id || res.assessment_id);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err?.message || 'تعذّر بدء التقييم.');
        }
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [questionsData, assessmentId, toast]);

  if (loading) return <FullPageSpinner />;
  if (error) {
    return (
      <PageContainer>
        <EmptyState
          title="تعذّر تحميل الأسئلة"
          description={error}
          action={<Button onClick={refresh}>إعادة المحاولة</Button>}
        />
      </PageContainer>
    );
  }

  if (!questionsData || allQuestions.length === 0) {
    return (
      <PageContainer>
        <EmptyState
          title="لا توجد أسئلة متاحة"
          description="يرجى التواصل مع الدعم الفني."
        />
      </PageContainer>
    );
  }

  const total = allQuestions.length;
  const currentQ = allQuestions[currentIdx];
  const allAnswered = allQuestions.every((q) => answers[q.id] != null);
  const answeredCount = allQuestions.filter((q) => answers[q.id] != null).length;

  const handleAnswer = (value) => {
    setAnswers((a) => ({ ...a, [currentQ.id]: value }));
  };

  const goNext = () => {
    if (currentIdx < total - 1) setCurrentIdx((i) => i + 1);
  };
  const goPrev = () => {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
  };

  const handleSubmit = async () => {
    if (!allAnswered) {
      toast.error(t('assessment.incomplete'));
      return;
    }
    if (!assessmentId) {
      toast.error('لم يتم إنشاء التقييم بعد، يرجى الانتظار لحظة.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        answers: allQuestions.map((q) => ({
          question_id: q.id,
          score: answers[q.id],
        })),
      };
      await assessmentApi.submit(assessmentId, payload);
      toast.success('تم إرسال تقييمك! يتم تحليل النتائج الآن…');
      navigate(`/assessment/${assessmentId}/results`);
    } catch (err) {
      if (err?.errors) {
        const firstField = Object.values(err.errors).flat()[0];
        toast.error(firstField || err.message);
      } else {
        toast.error(err?.message || 'تعذّر إرسال التقييم.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={t('assessment.title')}
        subtitle={t('assessment.subtitle')}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <QuestionCard
            index={currentIdx}
            total={total}
            pillar={currentQ.pillar_name}
            question={currentQ.text}
            value={answers[currentQ.id]}
            onChange={handleAnswer}
          />

          <div className="mt-4 flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={goPrev}
              disabled={currentIdx === 0}
              rightIcon={<ArrowRight size={16} />}
            >
                {t('common.back')}
              </Button>

            {currentIdx < total - 1 ? (
              <Button
                onClick={goNext}
                disabled={answers[currentQ.id] == null}
                leftIcon={<ArrowLeft size={16} />}
              >
                {t('common.next')}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                loading={submitting}
                disabled={!allAnswered}
                leftIcon={<CheckCircle2 size={16} />}
              >
                {t('assessment.submit')}
              </Button>
            )}
          </div>

          {/* Question dots navigation */}
          <div className="mt-6 flex flex-wrap items-center gap-1.5">
            {allQuestions.map((q, i) => {
              const answered = answers[q.id] != null;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(i)}
                  className={clsx(
                    'h-2.5 w-2.5 rounded-full transition',
                    i === currentIdx
                      ? 'w-6 bg-brand-600'
                      : answered
                      ? 'bg-emerald-400'
                      : 'bg-slate-200',
                  )}
                  aria-label={`الانتقال للسؤال ${i + 1}`}
                />
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <AssessmentProgress
            pillars={questionsData.pillars}
            answers={answers}
            locale={locale}
          />
          <Card className="p-5">
            <h3 className="text-sm font-bold text-slate-900">ملاحظة</h3>
            <p className="mt-2 text-xs text-slate-500">
              أجب بصدق بناءً على وضع فريقك الحالي. كل سؤال من 1 (ضعيف جداً)
              إلى 5 (ممتاز). يمكنك التنقل بين الأسئلة وتعديل إجاباتك قبل
              الإرسال.
            </p>
            <div className="mt-3 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
              {answeredCount}/{total} سؤال تمت الإجابة
            </div>
          </Card>
          {!assessmentId && (
            <Card className="border-amber-200 bg-amber-50 p-4 text-xs text-amber-700">
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                جارٍ تجهيز جلسة التقييم…
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
