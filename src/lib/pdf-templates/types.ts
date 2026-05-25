// Structured resume shape produced by parseResumeMarkdown, consumed by all
// PDF templates. Mirrors the markdown conventions enforced by rewritePrompt.

export interface ResumeBasics {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  location: string;
}

export interface ResumeExperience {
  title: string;
  company: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface ResumeEducation {
  school: string;
  degree: string;
  major: string;
  start: string;
  end: string;
  gpa: string;
}

export interface ResumeProject {
  name: string;
  description: string;
  bullets: string[];
  link: string;
}

export interface ResumeCertification {
  name: string;
  issuer: string;
  date: string;
}

export interface ResumeSkills {
  technical: string[];
  soft: string[];
}

export interface StructuredResume {
  basics: ResumeBasics;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkills;
  projects: ResumeProject[];
  certifications: ResumeCertification[];
}
