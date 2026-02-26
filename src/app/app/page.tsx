"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader2, Lock, Download, Clock, AlertCircle, Crown, CheckCircle, Copy, Check } from "lucide-react";
import { track } from "@/lib/analytics";

// Mock results data
const MOCK_RESULTS = {
  optimizedResume: `JOHN DOE
Software Engineer | Full-Stack Developer

PROFESSIONAL SUMMARY
Results-driven Software Engineer with 5+ years of experience in full-stack development, specializing in React, Node.js, and cloud technologies. Proven track record of delivering scalable solutions and leading cross-functional teams.

TECHNICAL SKILLS
• Languages: JavaScript, TypeScript, Python, Java
• Frontend: React, Next.js, Vue.js, Tailwind CSS
• Backend: Node.js, Express, Django, REST APIs
• Cloud: AWS (EC2, S3, Lambda), Azure, Docker, Kubernetes
• Databases: PostgreSQL, MongoDB, Redis

PROFESSIONAL EXPERIENCE

Senior Software Engineer | Tech Corp Inc. | 2021 - Present
• Led development of microservices architecture serving 1M+ users
• Improved application performance by 40% through optimization
• Mentored team of 5 junior developers

Software Engineer | StartupXYZ | 2019 - 2021
• Built responsive web applications using React and Node.js
• Implemented CI/CD pipelines reducing deployment time by 60%
• Collaborated with product team to deliver features on schedule

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2019`,

  coverLetter: `Dear Hiring Manager,

I am writing to express my strong interest in the Senior Software Engineer position at your company. With over 5 years of experience in full-stack development and a proven track record of delivering scalable solutions, I am confident that my skills and expertise align perfectly with your requirements.

Throughout my career, I have specialized in building high-performance web applications using modern technologies such as React, Node.js, and cloud platforms. At Tech Corp Inc., I led the development of a microservices architecture that now serves over 1 million users daily, improving overall application performance by 40%.

What excites me most about this opportunity is your company's commitment to innovation and technical excellence. Your focus on building cutting-edge solutions resonates with my passion for solving complex problems and delivering exceptional user experiences.

I am particularly drawn to the challenges mentioned in the job description, including scaling infrastructure and mentoring team members. In my current role, I have successfully implemented cloud-native solutions using AWS and have mentored a team of 5 junior developers, helping them grow their technical skills and career trajectories.

I would welcome the opportunity to discuss how my experience and skills can contribute to your team's success. Thank you for considering my application.

Sincerely,
John Doe`,

  keywordGap: `KEYWORD ANALYSIS REPORT

✅ MATCHING KEYWORDS (Found in Resume):
• JavaScript / TypeScript
• React / Next.js
• Node.js
• AWS / Cloud Computing
• Full-Stack Development
• Microservices Architecture
• CI/CD
• Team Leadership
• Performance Optimization

⚠️ MISSING KEYWORDS (Add to Resume):
• GraphQL
• Terraform
• Kubernetes (mentioned but could be emphasized more)
• Agile/Scrum Methodologies
• Test-Driven Development (TDD)
• System Design
• Monitoring & Observability
• Security Best Practices

💡 RECOMMENDATIONS:
1. Add "GraphQL" to your technical skills section
2. Mention "Agile/Scrum" in your experience descriptions
3. Include specific testing frameworks (Jest, React Testing Library)
4. Highlight any security-related achievements
5. Add metrics around system reliability and monitoring

MATCH SCORE: 75%
Your resume covers most required skills but could be strengthened by adding the missing keywords above.`,

  interviewQuestions: `COMMON INTERVIEW QUESTIONS FOR THIS ROLE

TECHNICAL QUESTIONS:
1. Can you explain the difference between REST and GraphQL? When would you use one over the other?

2. How would you design a system to handle 1 million concurrent users?

3. Describe your experience with microservices architecture. What are the main challenges?

4. Explain how you would optimize a slow-performing React application.

5. What's your approach to implementing CI/CD pipelines?

BEHAVIORAL QUESTIONS:
1. Tell me about a time when you had to make a difficult technical decision. What was the outcome?

2. Describe a situation where you had to debug a complex production issue. How did you approach it?

3. How do you handle disagreements with team members about technical approaches?

4. Tell me about a project you're most proud of and why.

5. How do you stay updated with new technologies and industry trends?

LEADERSHIP QUESTIONS:
1. Describe your experience mentoring junior developers.

2. How do you prioritize tasks when managing multiple projects?

3. Tell me about a time when you had to deliver a project under tight deadlines.

PREPARATION TIPS:
✓ Review your past projects and prepare specific examples
✓ Use the STAR method (Situation, Task, Action, Result)
✓ Practice coding problems on platforms like LeetCode
✓ Research the company's tech stack and recent news
✓ Prepare questions to ask the interviewer`,
};

interface GeneratedResults {
  optimizedResume: string;
  coverLetter: string;
  keywordGap: string;
  interviewQuestions: string;
}

type OutputType = "optimizedResume" | "coverLetter" | "keywordGap" | "interviewQuestions";

interface RefineState {
  isLoading: boolean;
  error: string | null;
  instruction: string;
}

interface HistoryItem {
  id: string;
  createdAt: number;
  resumeText: string;
  jobText: string;
  outputs: GeneratedResults;
}

interface UsageLimits {
  date: string;
  generations: number;
  refinements: number;
}

const BETA_ACCESS_KEY = "aurevia_beta_access";
const BETA_CODE_KEY = "aurevia_beta_code";
const HISTORY_KEY = "aurevia_history";
const USAGE_KEY = "aurevia_usage";
const DEVICE_ID_KEY = "aurevia_device_id";

const MAX_GENERATIONS_PER_DAY = 3;
const MAX_REFINEMENTS_PER_DAY = 3;

// Server-side beta code validation
const validateBetaCode = async (code: string): Promise<boolean> => {
  try {
    const response = await fetch("/api/beta/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.ok === true;
  } catch {
    return false;
  }
};

export default function AppPage() {
  // Beta access state
  const [hasAccess, setHasAccess] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [accessError, setAccessError] = useState("");
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isRevoked, setIsRevoked] = useState(false);

  // View state - expanded to include all views
  const [currentView, setCurrentView] = useState<"optimizer" | "history" | "interview" | "settings">("optimizer");

  // Pro state
  const [deviceId, setDeviceId] = useState<string>("");
  const [isPro, setIsPro] = useState(false);
  const [isCheckingPro, setIsCheckingPro] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  // Copy state for interview page
  const [copied, setCopied] = useState(false);

  // Existing state
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [results, setResults] = useState<GeneratedResults>(MOCK_RESULTS);
  const [error, setError] = useState<string | null>(null);

  // Refinement state for each section
  const [refineStates, setRefineStates] = useState<Record<OutputType, RefineState>>({
    optimizedResume: { isLoading: false, error: null, instruction: "" },
    coverLetter: { isLoading: false, error: null, instruction: "" },
    keywordGap: { isLoading: false, error: null, instruction: "" },
    interviewQuestions: { isLoading: false, error: null, instruction: "" },
  });

  // Download state
  const [isDownloadingResume, setIsDownloadingResume] = useState(false);
  const [isDownloadingCoverLetter, setIsDownloadingCoverLetter] = useState(false);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Usage limits state
  const [usage, setUsage] = useState<UsageLimits>({
    date: new Date().toDateString(),
    generations: 0,
    refinements: 0,
  });

  // Initialize deviceId and check Pro status on mount
  useEffect(() => {
    // Get or create deviceId
    let storedDeviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!storedDeviceId) {
      storedDeviceId = crypto.randomUUID();
      localStorage.setItem(DEVICE_ID_KEY, storedDeviceId);
    }
    setDeviceId(storedDeviceId);

    track("app_loaded");

    // Check beta access and validate stored code against server
    const storedAccess = localStorage.getItem(BETA_ACCESS_KEY);
    const storedCode = localStorage.getItem(BETA_CODE_KEY);

    if (storedAccess === "true" && storedCode) {
      validateBetaCode(storedCode).then((valid) => {
        if (valid) {
          setHasAccess(true);
        } else {
          setIsRevoked(true);
          setHasAccess(false);
        }
        setIsCheckingAccess(false);
      });
    } else {
      setIsCheckingAccess(false);
    }

    // Load history
    const storedHistory = localStorage.getItem(HISTORY_KEY);
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error("Failed to load history:", e);
      }
    }

    // Load usage limits
    const storedUsage = localStorage.getItem(USAGE_KEY);
    if (storedUsage) {
      try {
        const parsed = JSON.parse(storedUsage);
        const today = new Date().toDateString();

        // Reset if different day
        if (parsed.date !== today) {
          const newUsage = { date: today, generations: 0, refinements: 0 };
          setUsage(newUsage);
          localStorage.setItem(USAGE_KEY, JSON.stringify(newUsage));
        } else {
          setUsage(parsed);
        }
      } catch (e) {
        console.error("Failed to load usage:", e);
      }
    }

    // Check for checkout result in URL
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutStatus = urlParams.get("checkout");
    if (checkoutStatus === "success") {
      track("pro_unlocked");
      setCheckoutMessage("🎉 Payment successful! Your Pro account is being activated...");
      // Remove checkout param from URL
      window.history.replaceState({}, "", "/app");
      // Refresh Pro status
      setTimeout(() => checkProStatus(storedDeviceId), 2000);
    } else if (checkoutStatus === "cancel") {
      setCheckoutMessage("Payment cancelled. You can upgrade anytime!");
      window.history.replaceState({}, "", "/app");
      setTimeout(() => setCheckoutMessage(null), 5000);
    }
  }, []);

  // Check Pro status when deviceId is available
  useEffect(() => {
    if (deviceId) {
      checkProStatus(deviceId);
    }
  }, [deviceId]);

  const checkProStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/pro-status?deviceId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setIsPro(data.isPro);
      }
    } catch (err) {
      console.error("Failed to check Pro status:", err);
    } finally {
      setIsCheckingPro(false);
    }
  };

  const handleUpgradeToPro = async () => {
    if (!deviceId) return;

    setIsUpgrading(true);
    track("upgrade_clicked");

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deviceId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Upgrade error:", err);
      alert("Failed to start checkout. Please try again.");
      setIsUpgrading(false);
    }
  };

  const handleCopyRequest = () => {
    const message = "I'd like to request the Interview Coach feature for Aurevia Career Coach!";
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveHistory = (newItem: HistoryItem) => {
    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setResume(item.resumeText);
    setJobDescription(item.jobText);
    setResults(item.outputs);
    setHasResults(true);
    setCurrentView("optimizer");
  };

  const updateUsage = (type: "generation" | "refinement") => {
    // Don't track usage for Pro users
    if (isPro) return;

    const newUsage = {
      ...usage,
      generations: type === "generation" ? usage.generations + 1 : usage.generations,
      refinements: type === "refinement" ? usage.refinements + 1 : usage.refinements,
    };
    setUsage(newUsage);
    localStorage.setItem(USAGE_KEY, JSON.stringify(newUsage));
  };

  // Pro users have unlimited, free users have limits
  const canGenerate = () => isPro || usage.generations < MAX_GENERATIONS_PER_DAY;
  const canRefine = () => isPro || usage.refinements < MAX_REFINEMENTS_PER_DAY;

  const [isValidating, setIsValidating] = useState(false);

  const handleAccessSubmit = async () => {
    const normalizedInput = accessCode.trim().toUpperCase();
    if (!normalizedInput) return;

    setIsValidating(true);
    setAccessError("");

    const isValid = await validateBetaCode(normalizedInput);
    track("beta_code_entered", { valid: isValid });

    if (isValid) {
      localStorage.setItem(BETA_ACCESS_KEY, "true");
      localStorage.setItem(BETA_CODE_KEY, normalizedInput);
      setHasAccess(true);
      setAccessError("");
      setIsRevoked(false);
    } else {
      setAccessError("Invalid access code. Please try again.");
    }

    setIsValidating(false);
  };

  const handleLockApp = () => {
    // Clear both beta access keys
    localStorage.removeItem(BETA_ACCESS_KEY);
    localStorage.removeItem(BETA_CODE_KEY);
    window.location.reload();
  };

  const handleGenerate = async () => {
    // Check usage limit
    if (!canGenerate()) {
      setError(
        `Daily generation limit reached (${MAX_GENERATIONS_PER_DAY}/day). Upgrade to Pro for unlimited access!`
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    track("generate_clicked");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText: resume,
          jobText: jobDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to generate content. Please try again."
        );
      }

      const data = await response.json();
      setResults(data);
      setHasResults(true);

      // Update usage
      updateUsage("generation");

      // Save to history
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        createdAt: Date.now(),
        resumeText: resume,
        jobText: jobDescription,
        outputs: data,
      };
      saveHistory(historyItem);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async (outputType: OutputType) => {
    const instruction = refineStates[outputType].instruction;

    if (!instruction.trim()) {
      return;
    }

    // Check usage limit
    if (!canRefine()) {
      setRefineStates((prev) => ({
        ...prev,
        [outputType]: {
          ...prev[outputType],
          error: `Daily refinement limit reached (${MAX_REFINEMENTS_PER_DAY}/day). Upgrade to Pro for unlimited access!`,
        },
      }));
      return;
    }

    // Set loading state for this specific section
    setRefineStates((prev) => ({
      ...prev,
      [outputType]: { ...prev[outputType], isLoading: true, error: null },
    }));
    track("refine_clicked", { outputType });

    try {
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          outputType,
          currentText: results[outputType],
          instruction,
          resumeText: resume,
          jobText: jobDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to refine content. Please try again."
        );
      }

      const data = await response.json();

      // Update only this section's content
      const updatedResults = {
        ...results,
        [outputType]: data.refinedText,
      };
      setResults(updatedResults);

      // Update usage
      updateUsage("refinement");

      // Save to history
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        createdAt: Date.now(),
        resumeText: resume,
        jobText: jobDescription,
        outputs: updatedResults,
      };
      saveHistory(historyItem);

      // Clear the instruction input on success
      setRefineStates((prev) => ({
        ...prev,
        [outputType]: { ...prev[outputType], instruction: "", isLoading: false },
      }));
    } catch (err) {
      setRefineStates((prev) => ({
        ...prev,
        [outputType]: {
          ...prev[outputType],
          isLoading: false,
          error:
            err instanceof Error
              ? err.message
              : "An unexpected error occurred. Please try again.",
        },
      }));
    }
  };

  const updateRefineInstruction = (outputType: OutputType, value: string) => {
    setRefineStates((prev) => ({
      ...prev,
      [outputType]: { ...prev[outputType], instruction: value },
    }));
  };

  const handleDownload = async (type: "resume" | "coverLetter") => {
    const isResume = type === "resume";
    const setLoading = isResume ? setIsDownloadingResume : setIsDownloadingCoverLetter;

    setLoading(true);
    track("docx_export_clicked", { type, isPro });

    try {
      const response = await fetch("/api/export/docx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: isResume ? "Optimized_Resume" : "Cover_Letter",
          title: isResume ? "Optimized Resume" : "Cover Letter",
          content: isResume ? results.optimizedResume : results.coverLetter,
          deviceId,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 403 && data.error === "pro_required") {
          setError("DOCX export is a Pro feature. Upgrade to export your documents!");
          return;
        }
        throw new Error("Failed to generate document");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${isResume ? "Optimized_Resume" : "Cover_Letter"}.docx`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking access
  if (isCheckingAccess) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Show revoked access message if code is no longer valid
  if (isRevoked) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-red-600">
              Access Revoked
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <p className="text-center text-slate-700">
                Your beta access code is no longer active. Contact support for assistance.
              </p>
            </div>
            <Button
              onClick={handleLockApp}
              variant="outline"
              className="w-full"
            >
              Try Different Code
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show beta access gate if no access
  if (!hasAccess) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Aurevia Career Coach
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-slate-600">Enter your beta invite code</p>
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter invite code"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value);
                  setAccessError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAccessSubmit();
                  }
                }}
              />
              {accessError && (
                <p className="text-sm text-red-600">{accessError}</p>
              )}
            </div>
            <Button onClick={handleAccessSubmit} disabled={isValidating} className="w-full">
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                "Enter"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show main app if access granted
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Fixed */}
      <aside className="hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Aurevia Career Coach
              </h2>
              {isPro && (
                <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-0.5">
                  <Crown className="h-3 w-3 text-white" />
                  <span className="text-xs font-bold text-white">PRO</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            <button
              onClick={() => setCurrentView("optimizer")}
              className={`block w-full rounded-lg px-4 py-2 text-left text-sm font-medium ${
                currentView === "optimizer"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              Optimizer
            </button>
            <button
              onClick={() => setCurrentView("history")}
              className={`block w-full rounded-lg px-4 py-2 text-left text-sm font-medium ${
                currentView === "history"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              History
            </button>
            <button
              onClick={() => setCurrentView("interview")}
              className={`block w-full rounded-lg px-4 py-2 text-left text-sm font-medium ${
                currentView === "interview"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              Interview Coach
              <span className="ml-2 text-xs text-slate-400">(Coming Soon)</span>
            </button>
            <button
              onClick={() => setCurrentView("settings")}
              className={`block w-full rounded-lg px-4 py-2 text-left text-sm font-medium ${
                currentView === "settings"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              Settings
            </button>
          </nav>

          {/* Upgrade Button */}
          {!isPro && (
            <div className="border-t border-slate-200 p-4">
              <Button
                onClick={handleUpgradeToPro}
                disabled={isUpgrading}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
              >
                {isUpgrading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Usage Stats (only show for non-Pro) */}
          {!isPro && (
            <div className="border-t border-slate-200 p-4">
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Generations today:</span>
                  <span className="font-medium">
                    {usage.generations}/{MAX_GENERATIONS_PER_DAY}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Refinements today:</span>
                  <span className="font-medium">
                    {usage.refinements}/{MAX_REFINEMENTS_PER_DAY}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pro Status (for Pro users) */}
          {isPro && (
            <div className="border-t border-slate-200 p-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Unlimited generations & refinements</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-slate-200 p-4 space-y-2">
            <button
              onClick={handleLockApp}
              className="flex w-full items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
            >
              <Lock className="h-4 w-4" />
              Lock App
            </button>
            <a
              href="/"
              className="block text-sm text-slate-600 hover:text-slate-900"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-4 lg:p-8">
          {/* Mobile Header */}
          <div className="mb-6 lg:hidden">
            <h1 className="text-2xl font-bold text-slate-900">
              Aurevia Career Coach
            </h1>
          </div>

          {/* Checkout Success/Cancel Message */}
          {checkoutMessage && (
            <div className="mb-6 rounded-lg bg-green-50 p-4 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-900">{checkoutMessage}</p>
              </div>
            </div>
          )}

          {/* Interview Coach View */}
          {currentView === "interview" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Interview Coach (Coming Soon)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-slate-600">
                    Practice and ace your interviews with AI-powered coaching.
                  </p>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900">
                      What Interview Coach will include:
                    </h3>
                    <ul className="space-y-2 text-slate-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>
                          <strong>Mock Interviews:</strong> Practice with realistic
                          interview simulations tailored to your target role
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>
                          <strong>Real-time Scoring:</strong> Get instant feedback on
                          your answers with detailed performance metrics
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>
                          <strong>Personalized Feedback:</strong> Receive AI-powered
                          suggestions to improve your interview technique
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>
                          <strong>Question Bank:</strong> Access hundreds of common
                          interview questions for your industry
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>
                          <strong>Progress Tracking:</strong> Monitor your improvement
                          over time with detailed analytics
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleCopyRequest} className="gap-2">
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Request this feature
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-slate-500 mt-2">
                      Click to copy a feature request message to your clipboard
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings View */}
          {currentView === "settings" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Plan Status */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900">Plan Status</h3>
                    <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4">
                      {isPro ? (
                        <>
                          <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1.5">
                            <Crown className="h-4 w-4 text-white" />
                            <span className="text-sm font-bold text-white">PRO</span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              Pro Subscription
                            </p>
                            <p className="text-sm text-slate-600">
                              Unlimited generations and refinements
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5">
                            <span className="text-sm font-medium text-slate-700">
                              FREE
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">Free Plan</p>
                            <p className="text-sm text-slate-600">
                              {MAX_GENERATIONS_PER_DAY} generations and{" "}
                              {MAX_REFINEMENTS_PER_DAY} refinements per day
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Manage Subscription */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900">Subscription</h3>
                    {isPro ? (
                      <div>
                        <Button variant="outline" disabled>
                          Manage Subscription
                        </Button>
                        <p className="text-sm text-slate-500 mt-2">
                          Stripe Customer Portal integration coming soon
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Button
                          onClick={handleUpgradeToPro}
                          disabled={isUpgrading}
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
                        >
                          {isUpgrading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <Crown className="mr-2 h-4 w-4" />
                              Upgrade to Pro
                            </>
                          )}
                        </Button>
                        <p className="text-sm text-slate-500 mt-2">
                          Get unlimited access to all features
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Security */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900">Security</h3>
                    <div>
                      <Button
                        onClick={handleLockApp}
                        variant="outline"
                        className="gap-2"
                      >
                        <Lock className="h-4 w-4" />
                        Lock App
                      </Button>
                      <p className="text-sm text-slate-500 mt-2">
                        Require access code to unlock the app
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* History View */}
          {currentView === "history" && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-4 text-2xl font-bold text-slate-900">
                  History
                </h2>
                <p className="text-slate-600">
                  View and restore your previous generations.
                </p>
              </div>

              {history.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-500">No history yet</p>
                    <p className="text-sm text-slate-400">
                      Your generated resumes will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => {
                    const date = new Date(item.createdAt);
                    const preview = item.outputs.optimizedResume
                      .split("\n")[0]
                      .substring(0, 60);

                    return (
                      <Card
                        key={item.id}
                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => loadHistoryItem(item)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">
                                {preview}...
                              </p>
                              <p className="text-sm text-slate-500 mt-1">
                                {date.toLocaleDateString()} at{" "}
                                {date.toLocaleTimeString()}
                              </p>
                            </div>
                            <Clock className="h-4 w-4 text-slate-400 ml-4 flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Optimizer View */}
          {currentView === "optimizer" && (
            <>
              {/* Input Section */}
              <div className="mb-8 space-y-6">
                <div>
                  <h2 className="mb-4 text-2xl font-bold text-slate-900">
                    Resume Optimizer
                  </h2>
                  <p className="text-slate-600">
                    Paste your resume and the job description to get personalized
                    optimization suggestions.
                  </p>
                </div>

                {/* Usage Limit Warning (only for non-Pro) */}
                {!isPro && !canGenerate() && (
                  <div className="rounded-lg bg-amber-50 p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-900">
                        Daily generation limit reached
                      </p>
                      <p className="text-sm text-amber-700">
                        You've used all {MAX_GENERATIONS_PER_DAY} generations for
                        today. Upgrade to Pro for unlimited access!
                      </p>
                    </div>
                  </div>
                )}

                {/* Text Areas - Side by side on desktop, stacked on mobile */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="resume"
                      className="text-sm font-medium text-slate-900"
                    >
                      Your Resume
                    </label>
                    <Textarea
                      id="resume"
                      placeholder="Paste your resume here..."
                      value={resume}
                      onChange={(e) => setResume(e.target.value)}
                      className="min-h-[300px] resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="job-description"
                      className="text-sm font-medium text-slate-900"
                    >
                      Job Description
                    </label>
                    <Textarea
                      id="job-description"
                      placeholder="Paste the job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="min-h-[300px] resize-none"
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={handleGenerate}
                    disabled={isLoading || !resume || !jobDescription || !canGenerate()}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate"
                    )}
                  </Button>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Error Message */}
              {error && (
                <div className="mb-8 rounded-lg bg-red-50 p-4 text-red-700">
                  <p className="font-medium">Error:</p>
                  <p>{error}</p>
                </div>
              )}

              {/* Output Section */}
              {hasResults && (
                <div className="space-y-4 pb-8">
                  <h3 className="text-xl font-bold text-slate-900">Results</h3>

                  <Tabs defaultValue="optimized-resume" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                      <TabsTrigger value="optimized-resume">
                        Optimized Resume
                      </TabsTrigger>
                      <TabsTrigger value="cover-letter">
                        Cover Letter
                      </TabsTrigger>
                      <TabsTrigger value="keyword-gap">Keyword Gap</TabsTrigger>
                      <TabsTrigger value="interview-questions">
                        Interview Questions
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="optimized-resume">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>Optimized Resume</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => isPro ? handleDownload("resume") : handleUpgradeToPro()}
                              disabled={isDownloadingResume}
                              title={isPro ? "Download as DOCX" : "Upgrade to Pro to export DOCX"}
                            >
                              {isDownloadingResume ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Downloading...
                                </>
                              ) : isPro ? (
                                <>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download (.docx)
                                </>
                              ) : (
                                <>
                                  <Lock className="mr-2 h-4 w-4" />
                                  Download (.docx)
                                  <Crown className="ml-1 h-3 w-3 text-amber-500" />
                                </>
                              )}
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">
                              {results.optimizedResume}
                            </pre>
                          </ScrollArea>

                          {/* Refinement Section */}
                          <div className="space-y-2 border-t pt-4">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Enter refinement request..."
                                value={refineStates.optimizedResume.instruction}
                                onChange={(e) =>
                                  updateRefineInstruction("optimizedResume", e.target.value)
                                }
                                disabled={refineStates.optimizedResume.isLoading || !canRefine()}
                              />
                              <Button
                                onClick={() => handleRefine("optimizedResume")}
                                disabled={
                                  refineStates.optimizedResume.isLoading ||
                                  !refineStates.optimizedResume.instruction.trim() ||
                                  !canRefine()
                                }
                              >
                                {refineStates.optimizedResume.isLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Refining...
                                  </>
                                ) : (
                                  "Refine"
                                )}
                              </Button>
                            </div>
                            {refineStates.optimizedResume.error && (
                              <p className="text-sm text-red-600">
                                {refineStates.optimizedResume.error}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="cover-letter">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>Cover Letter</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => isPro ? handleDownload("coverLetter") : handleUpgradeToPro()}
                              disabled={isDownloadingCoverLetter}
                              title={isPro ? "Download as DOCX" : "Upgrade to Pro to export DOCX"}
                            >
                              {isDownloadingCoverLetter ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Downloading...
                                </>
                              ) : isPro ? (
                                <>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download (.docx)
                                </>
                              ) : (
                                <>
                                  <Lock className="mr-2 h-4 w-4" />
                                  Download (.docx)
                                  <Crown className="ml-1 h-3 w-3 text-amber-500" />
                                </>
                              )}
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">
                              {results.coverLetter}
                            </pre>
                          </ScrollArea>

                          {/* Refinement Section */}
                          <div className="space-y-2 border-t pt-4">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Enter refinement request..."
                                value={refineStates.coverLetter.instruction}
                                onChange={(e) =>
                                  updateRefineInstruction("coverLetter", e.target.value)
                                }
                                disabled={refineStates.coverLetter.isLoading || !canRefine()}
                              />
                              <Button
                                onClick={() => handleRefine("coverLetter")}
                                disabled={
                                  refineStates.coverLetter.isLoading ||
                                  !refineStates.coverLetter.instruction.trim() ||
                                  !canRefine()
                                }
                              >
                                {refineStates.coverLetter.isLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Refining...
                                  </>
                                ) : (
                                  "Refine"
                                )}
                              </Button>
                            </div>
                            {refineStates.coverLetter.error && (
                              <p className="text-sm text-red-600">
                                {refineStates.coverLetter.error}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="keyword-gap">
                      <Card>
                        <CardHeader>
                          <CardTitle>Keyword Gap Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">
                              {results.keywordGap}
                            </pre>
                          </ScrollArea>

                          {/* Refinement Section */}
                          <div className="space-y-2 border-t pt-4">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Enter refinement request..."
                                value={refineStates.keywordGap.instruction}
                                onChange={(e) =>
                                  updateRefineInstruction("keywordGap", e.target.value)
                                }
                                disabled={refineStates.keywordGap.isLoading || !canRefine()}
                              />
                              <Button
                                onClick={() => handleRefine("keywordGap")}
                                disabled={
                                  refineStates.keywordGap.isLoading ||
                                  !refineStates.keywordGap.instruction.trim() ||
                                  !canRefine()
                                }
                              >
                                {refineStates.keywordGap.isLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Refining...
                                  </>
                                ) : (
                                  "Refine"
                                )}
                              </Button>
                            </div>
                            {refineStates.keywordGap.error && (
                              <p className="text-sm text-red-600">
                                {refineStates.keywordGap.error}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="interview-questions">
                      <Card>
                        <CardHeader>
                          <CardTitle>Interview Questions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">
                              {results.interviewQuestions}
                            </pre>
                          </ScrollArea>

                          {/* Refinement Section */}
                          <div className="space-y-2 border-t pt-4">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Enter refinement request..."
                                value={refineStates.interviewQuestions.instruction}
                                onChange={(e) =>
                                  updateRefineInstruction("interviewQuestions", e.target.value)
                                }
                                disabled={refineStates.interviewQuestions.isLoading || !canRefine()}
                              />
                              <Button
                                onClick={() => handleRefine("interviewQuestions")}
                                disabled={
                                  refineStates.interviewQuestions.isLoading ||
                                  !refineStates.interviewQuestions.instruction.trim() ||
                                  !canRefine()
                                }
                              >
                                {refineStates.interviewQuestions.isLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Refining...
                                  </>
                                ) : (
                                  "Refine"
                                )}
                              </Button>
                            </div>
                            {refineStates.interviewQuestions.error && (
                              <p className="text-sm text-red-600">
                                {refineStates.interviewQuestions.error}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
