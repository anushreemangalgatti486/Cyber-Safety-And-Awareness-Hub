import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Shield, Lock, EyeOff, ChevronRight, CheckCircle, XCircle, Award } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const TOPICS = [
  {
    id: 1,
    title: 'Phishing Attacks',
    icon: EyeOff,
    color: 'text-cyber-accent',
    border: 'border-cyber-accent/30',
    bg: 'bg-cyber-accent/5',
    desc: 'Learn to identify deceptive emails, fake login pages, and social engineering attacks designed to steal your credentials.',
    tips: [
      'Always verify the sender\'s email domain carefully',
      'Hover over links before clicking to see the real URL',
      'Legitimate companies never ask for passwords via email',
      'Look for HTTPS and padlock icon on login pages',
    ],
  },
  {
    id: 2,
    title: 'Password Security',
    icon: Lock,
    color: 'text-cyber-secondary',
    border: 'border-cyber-secondary/30',
    bg: 'bg-cyber-secondary/5',
    desc: 'Master the art of creating unbreakable passwords and managing credentials securely across all your accounts.',
    tips: [
      'Use a minimum of 16 characters with mixed case, numbers, symbols',
      'Never reuse passwords across different sites',
      'Use a reputable password manager',
      'Enable two-factor authentication everywhere possible',
    ],
  },
  {
    id: 3,
    title: 'Network Defense',
    icon: Shield,
    color: 'text-cyber-primary',
    border: 'border-cyber-primary/30',
    bg: 'bg-cyber-primary/5',
    desc: 'Understand firewalls, VPNs, and how to secure your home and work networks against intrusions.',
    tips: [
      'Use a VPN on public Wi-Fi networks',
      'Keep your router firmware updated',
      'Disable WPS on your router',
      'Use WPA3 encryption for your Wi-Fi',
    ],
  },
  {
    id: 4,
    title: 'Data Privacy',
    icon: BookOpen,
    color: 'text-green-400',
    border: 'border-green-400/30',
    bg: 'bg-green-400/5',
    desc: 'Discover how to protect your personal information on social media, apps, and the web.',
    tips: [
      'Review app permissions regularly',
      'Use privacy-focused browsers and search engines',
      'Limit personal info shared on social media',
      'Regularly check your digital footprint',
    ],
  },
];

const QUIZ = {
  question: 'Which of the following URLs is a dangerous phishing link?',
  options: [
    { text: 'https://accounts.google.com/login', safe: true },
    { text: 'https://accounts-google-security.com/login', safe: false },
    { text: 'https://myaccount.google.com', safe: true },
    { text: 'https://g00gle-verify.net/account', safe: false },
  ],
  explanation: 'Phishing URLs often mimic legitimate domains by adding words like "security", using hyphens, or replacing letters (g00gle). Always check the exact domain name.',
};

/**
 * LearningHub - Cyber security education center
 */
export default function LearningHub() {
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizScore, setQuizScore] = useState(0);

  const handleQuizAnswer = (option) => {
    if (quizAnswer !== null) return;
    setQuizAnswer(option);
    if (!option.safe) setQuizScore(prev => prev + 1);
  };

  return (
    <div className="p-4 md:p-8 mt-16 ml-0 md:ml-64 min-h-[calc(100vh-4rem)] pb-16">
      {/* Header */}
      <PageHeader
        title="CYBER ACADEMY"
        subtitle="Equip yourself with knowledge to defend against modern cyber threats"
        icon={BookOpen}
        iconColor="text-cyber-primary"
        glowColor="primary"
        backTo="/home"
      />

      {/* Topic cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {TOPICS.map((topic, i) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-panel rounded-xl border cursor-pointer transition-all duration-300 overflow-hidden ${topic.border} ${
              expandedTopic === topic.id ? topic.bg : 'hover:bg-white/3'
            }`}
            onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
          >
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${topic.bg} border ${topic.border}`}>
                    <topic.icon className={`w-5 h-5 ${topic.color}`} />
                  </div>
                  <h3 className="font-bold text-white">{topic.title}</h3>
                </div>
                <motion.div
                  animate={{ rotate: expandedTopic === topic.id ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className={`w-5 h-5 ${topic.color}`} />
                </motion.div>
              </div>
              <p className="text-cyber-muted text-sm mt-3 leading-relaxed">{topic.desc}</p>
            </div>

            <AnimatePresence>
              {expandedTopic === topic.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className={`px-5 pb-5 border-t ${topic.border} pt-4`}>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${topic.color}`}>
                      Key Security Tips
                    </h4>
                    <ul className="space-y-2">
                      {topic.tips.map((tip, j) => (
                        <motion.li
                          key={j}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: j * 0.08 }}
                          className="flex items-start gap-2 text-sm text-cyber-text/80"
                        >
                          <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${topic.color}`} />
                          {tip}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Daily Challenge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel rounded-xl p-5 md:p-8 border border-cyber-primary/20 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-48 h-48 bg-cyber-primary/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="flex items-center gap-3 mb-5">
          <Award className="w-6 h-6 text-yellow-400" />
          <h2 className="text-lg font-bold text-white">Daily Security Challenge</h2>
          {quizAnswer && (
            <span className="ml-auto text-xs font-mono text-cyber-primary bg-cyber-primary/10 px-2 py-1 rounded">
              {!quizAnswer.safe ? '+1 point' : 'Try again!'}
            </span>
          )}
        </div>

        <p className="text-cyber-text/80 mb-5 text-sm md:text-base">{QUIZ.question}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {QUIZ.options.map((option, i) => {
            let style = 'border-white/10 hover:border-cyber-primary/50 hover:bg-cyber-primary/5';
            if (quizAnswer) {
              if (option === quizAnswer) {
                style = option.safe
                  ? 'border-green-400 bg-green-400/10 text-green-400'
                  : 'border-cyber-accent bg-cyber-accent/10 text-cyber-accent';
              } else if (!option.safe) {
                style = 'border-cyber-accent/50 bg-cyber-accent/5 text-cyber-accent/70';
              }
            }
            return (
              <button
                key={i}
                onClick={() => handleQuizAnswer(option)}
                disabled={quizAnswer !== null}
                className={`px-4 py-3 rounded-xl border text-left text-sm font-mono transition-all ${style} disabled:cursor-default`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{option.text}</span>
                  {quizAnswer && (
                    option.safe
                      ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      : <XCircle className="w-4 h-4 text-cyber-accent flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {quizAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border text-sm ${
                !quizAnswer.safe
                  ? 'border-green-400/30 bg-green-400/5 text-green-400'
                  : 'border-cyber-accent/30 bg-cyber-accent/5 text-cyber-accent'
              }`}
            >
              <p className="font-bold mb-1">
                {!quizAnswer.safe ? '✓ Correct!' : '✗ Incorrect — that URL is actually safe.'}
              </p>
              <p className="text-cyber-text/70">{QUIZ.explanation}</p>
              <button
                onClick={() => setQuizAnswer(null)}
                className="mt-3 text-xs text-cyber-primary hover:underline"
              >
                Try again →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
