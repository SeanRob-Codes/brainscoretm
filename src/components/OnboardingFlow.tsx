import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Moon, Briefcase, Target, ArrowRight, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    id: 'sleep',
    title: 'How much sleep do you usually get?',
    subtitle: 'This helps us personalize your brain training',
    icon: Moon,
    options: [
      { value: 'less-5', label: 'Less than 5 hours', emoji: '😴' },
      { value: '5-6', label: '5–6 hours', emoji: '🥱' },
      { value: '7-8', label: '7–8 hours', emoji: '😊' },
      { value: '9+', label: '9+ hours', emoji: '😴' },
    ],
  },
  {
    id: 'type',
    title: 'What best describes you?',
    subtitle: 'We\'ll tailor challenges to your lifestyle',
    icon: Briefcase,
    options: [
      { value: 'student', label: 'Student', emoji: '📚' },
      { value: 'athlete', label: 'Athlete', emoji: '🏃' },
      { value: 'worker', label: 'Working Professional', emoji: '💼' },
      { value: 'creative', label: 'Creative / Artist', emoji: '🎨' },
      { value: 'other', label: 'Other', emoji: '🌟' },
    ],
  },
  {
    id: 'goals',
    title: 'What do you want to improve?',
    subtitle: 'Pick all that apply',
    icon: Target,
    options: [
      { value: 'focus', label: 'Focus & Concentration', emoji: '🎯' },
      { value: 'speed', label: 'Processing Speed', emoji: '⚡' },
      { value: 'memory', label: 'Memory', emoji: '🧠' },
      { value: 'logic', label: 'Logic & Reasoning', emoji: '🧩' },
      { value: 'language', label: 'Language & Vocabulary', emoji: '📖' },
    ],
    multiSelect: true,
  },
];

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [saving, setSaving] = useState(false);

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleSelect = (value: string) => {
    if (currentStep.multiSelect) {
      const current = (answers[currentStep.id] as string[]) || [];
      if (current.includes(value)) {
        setAnswers({ ...answers, [currentStep.id]: current.filter(v => v !== value) });
      } else {
        setAnswers({ ...answers, [currentStep.id]: [...current, value] });
      }
    } else {
      setAnswers({ ...answers, [currentStep.id]: value });
    }
  };

  const isSelected = (value: string) => {
    const ans = answers[currentStep.id];
    if (Array.isArray(ans)) return ans.includes(value);
    return ans === value;
  };

  const canProceed = () => {
    const ans = answers[currentStep.id];
    if (Array.isArray(ans)) return ans.length > 0;
    return !!ans;
  };

  const handleNext = async () => {
    if (!isLast) {
      setStep(step + 1);
      return;
    }

    setSaving(true);
    if (user) {
      await supabase.from('profiles').update({
        sleep_hours: answers.sleep as string,
        user_type: answers.type as string,
        goals: answers.goals as string[],
        onboarding_complete: true,
      }).eq('user_id', user.id);
    }
    setSaving(false);
    onComplete();
  };

  const Icon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md p-4">
      <div className="w-full max-w-md space-y-6 animate-scale-in">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 gradient-accent' : i < step ? 'w-2 bg-accent/50' : 'w-2 bg-border'}`} />
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full gradient-accent p-3 glow-accent">
              <Icon className="h-6 w-6 text-accent-foreground" />
            </div>
            <h2 className="font-display text-base font-bold tracking-wider text-foreground">{currentStep.title}</h2>
            <p className="text-sm text-muted-foreground">{currentStep.subtitle}</p>
          </div>

          <div className="space-y-2">
            {currentStep.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all
                  ${isSelected(opt.value)
                    ? 'border-accent bg-accent/10 text-foreground'
                    : 'border-border bg-secondary/50 text-muted-foreground hover:border-accent/30 hover:text-foreground'
                  }`}
              >
                <span className="text-lg">{opt.emoji}</span>
                <span className="text-sm font-medium flex-1">{opt.label}</span>
                {isSelected(opt.value) && <CheckCircle className="h-4 w-4 text-accent" />}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceed() || saving}
            className="w-full gradient-accent rounded-xl py-3.5 text-sm font-bold uppercase tracking-widest text-accent-foreground hover:brightness-110 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isLast ? 'Get Started' : 'Continue'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <button onClick={onComplete} className="block mx-auto text-xs text-muted-foreground hover:text-foreground transition-colors">
          Skip for now
        </button>
      </div>
    </div>
  );
}
