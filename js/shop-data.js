(() => {
    const collections = {
        study: "Study & University",
        cs: "Computer Science & Programming",
        analytics: "Business & Analytics",
        career: "Career",
        faith: "Faith & Reflection",
        health: "Health & Lifestyle",
        creator: "Digital Creator Resources"
    };

    const typeByKeyword = [
        { key: "planner", type: "planner" },
        { key: "guide", type: "guide" },
        { key: "workbook", type: "workbook" },
        { key: "template", type: "template" },
        { key: "bundle", type: "bundle" },
        { key: "tracker", type: "tracker" },
        { key: "journal", type: "journal" },
        { key: "cheat", type: "guide" }
    ];

    const formatByCategory = {
        study: "PDF + Notion",
        cs: "PDF",
        analytics: "Excel + PDF",
        career: "PDF + DOCX",
        faith: "PDF",
        health: "PDF",
        creator: "PDF + Figma"
    };

    const products = [
        { id: "study-semester-planner", title: "Semester Planner", category: "study", description: "Term-level roadmap for deadlines, milestones, and weekly focus.", price: 12, isNew: true },
        { id: "study-assignment-tracker", title: "Assignment Tracker", category: "study", description: "Track assignment status, due dates, and submission notes.", price: 9 },
        { id: "study-exam-revision-planner", title: "Exam Revision Planner", category: "study", description: "Plan strategic revision sessions by topic and confidence.", price: 10 },
        { id: "study-study-session-planner", title: "Study Session Planner", category: "study", description: "Design focused sessions with objectives and reflection.", price: 8 },
        { id: "study-time-blocking-planner", title: "Time Blocking Planner", category: "study", description: "Structure daily flow with intentional time blocks.", price: 8 },
        { id: "study-cornell-notes-template", title: "Cornell Notes Template", category: "study", description: "Clean Cornell note system for lecture retention.", price: 5 },
        { id: "study-engineering-notebook", title: "Engineering Notebook", category: "study", description: "Technical notebook layout for projects and labs.", price: 11 },
        { id: "study-cs-note-template", title: "CS Note Template", category: "study", description: "Computer science concept capture and review format.", price: 7 },
        { id: "study-math-formula-sheet", title: "Math Formula Sheet", category: "study", description: "Organized formula reference for fast revision.", price: 6 },
        { id: "study-gpa-tracker", title: "GPA Tracker", category: "study", description: "Monitor cumulative GPA and course projections.", price: 7 },
        { id: "study-lab-report-template", title: "Lab Report Template", category: "study", description: "Professional structure for lab submissions.", price: 9 },
        { id: "study-internship-application-tracker", title: "Internship Application Tracker", category: "study", description: "Manage internship pipeline, status, and follow-ups.", price: 10 },
        { id: "study-weekly-study-planner", title: "Weekly Study Planner", category: "study", description: "Free weekly planning sheet to organize study priorities.", price: 0, free: true, isNew: true },

        { id: "cs-sql-cheat-sheet", title: "SQL Cheat Sheet", category: "cs", description: "Quick SQL syntax and query pattern reference.", price: 0, free: true },
        { id: "cs-git-cheat-sheet", title: "Git Cheat Sheet", category: "cs", description: "Essential Git commands for daily workflows.", price: 6 },
        { id: "cs-github-portfolio-checklist", title: "GitHub Portfolio Checklist", category: "cs", description: "Checklist to polish your public project profile.", price: 8 },
        { id: "cs-html-css-reference", title: "HTML/CSS Reference", category: "cs", description: "Core semantic HTML and modern CSS guide.", price: 9 },
        { id: "cs-javascript-quick-reference", title: "JavaScript Quick Reference", category: "cs", description: "Practical JavaScript essentials in one place.", price: 10 },
        { id: "cs-python-beginner-notes", title: "Python Beginner Notes", category: "cs", description: "Clear Python notes for first projects.", price: 10 },
        { id: "cs-data-structures-summary", title: "Data Structures Summary", category: "cs", description: "Concise summary of core data structures.", price: 12 },
        { id: "cs-algorithm-complexity-guide", title: "Algorithm Complexity Guide", category: "cs", description: "Big-O practical guide with examples.", price: 11 },
        { id: "cs-technical-interview-notes", title: "Technical Interview Notes", category: "cs", description: "Framework for technical interview prep.", price: 15 },
        { id: "cs-vscode-productivity-guide", title: "VS Code Productivity Guide", category: "cs", description: "Speed up coding workflows in VS Code.", price: 9 },

        { id: "analytics-kpi-dashboard-template", title: "KPI Dashboard Template", category: "analytics", description: "Track high-impact metrics with executive clarity.", price: 14 },
        { id: "analytics-business-metrics-tracker", title: "Business Metrics Tracker", category: "analytics", description: "Monthly metric tracking for operations and growth.", price: 12 },
        { id: "analytics-excel-dashboard", title: "Excel Dashboard", category: "analytics", description: "Pre-structured dashboard template in Excel.", price: 15 },
        { id: "analytics-monthly-business-review", title: "Monthly Business Review", category: "analytics", description: "Review template for strategic monthly decision-making.", price: 11 },
        { id: "analytics-client-discovery-workbook", title: "Client Discovery Workbook", category: "analytics", description: "Run structured client discovery calls.", price: 10 },
        { id: "analytics-report-template", title: "Analytics Report Template", category: "analytics", description: "Present insights with polished narrative structure.", price: 13 },
        { id: "analytics-sop-template-pack", title: "SOP Template Pack", category: "analytics", description: "Document repeatable workflows with clear SOPs.", price: 16 },
        { id: "analytics-small-business-dashboard", title: "Small Business Dashboard", category: "analytics", description: "Compact dashboard for owner-operator visibility.", price: 18 },

        { id: "career-resume-workbook", title: "Resume Workbook", category: "career", description: "Build stronger impact bullets and positioning.", price: 12 },
        { id: "career-resume-templates", title: "Resume Templates", category: "career", description: "Modern, ATS-conscious resume templates.", price: 10 },
        { id: "career-cover-letter-templates", title: "Cover Letter Templates", category: "career", description: "Professional cover letter frameworks.", price: 8 },
        { id: "career-linkedin-optimization-guide", title: "LinkedIn Optimization Guide", category: "career", description: "Upgrade profile quality and discoverability.", price: 12 },
        { id: "career-internship-tracker", title: "Internship Tracker", category: "career", description: "Pipeline tracking for internship applications.", price: 8 },
        { id: "career-interview-question-workbook", title: "Interview Question Workbook", category: "career", description: "Practice workbook for behavioral interview prep.", price: 11 },
        { id: "career-planning-workbook", title: "Career Planning Workbook", category: "career", description: "Map career direction and actionable milestones.", price: 14 },
        { id: "career-portfolio-planning-guide", title: "Portfolio Planning Guide", category: "career", description: "Position projects for stronger hiring outcomes.", price: 13 },

        { id: "faith-ramadan-planner", title: "Ramadan Planner", category: "faith", description: "Practical Ramadan planning pages and check-ins.", price: 8 },
        { id: "faith-daily-salah-tracker", title: "Daily Salah Tracker", category: "faith", description: "Simple tracker for consistent salah routine.", price: 5 },
        { id: "faith-quran-reflection-journal", title: "Qur'an Reflection Journal", category: "faith", description: "Reflective journaling pages for Qur'an study.", price: 10 },
        { id: "faith-gratitude-journal", title: "Gratitude Journal", category: "faith", description: "Intentional gratitude prompts and reflections.", price: 7 },
        { id: "faith-islamic-habit-tracker", title: "Islamic Habit Tracker", category: "faith", description: "Build practical habit consistency with intention.", price: 9 },
        { id: "faith-dhikr-tracker", title: "Dhikr Tracker", category: "faith", description: "Lightweight dhikr tracker for daily use.", price: 6 },

        { id: "health-beginner-basketball-program", title: "Beginner Basketball Program", category: "health", description: "Foundational training progression for new players.", price: 12 },
        { id: "health-home-workout-planner", title: "Home Workout Planner", category: "health", description: "Plan practical home workouts with progression.", price: 10 },
        { id: "health-habit-tracker", title: "Habit Tracker", category: "health", description: "Track daily habits and consistency goals.", price: 8 },
        { id: "health-wellness-planner", title: "Wellness Planner", category: "health", description: "Weekly wellness planning with reflection prompts.", price: 15 },
        { id: "health-daily-habit-tracker", title: "Daily Habit Tracker", category: "health", description: "Free daily tracker for routines and momentum.", price: 0, free: true },

        { id: "creator-website-planning-workbook", title: "Website Planning Workbook", category: "creator", description: "Plan pages, messaging, and content hierarchy.", price: 12 },
        { id: "creator-brand-style-guide-template", title: "Brand Style Guide Template", category: "creator", description: "Define brand voice, visuals, and standards.", price: 18 },
        { id: "creator-color-palette-planner", title: "Color Palette Planner", category: "creator", description: "Build intentional color systems quickly.", price: 10 },
        { id: "creator-content-calendar", title: "Content Calendar", category: "creator", description: "Plan content cadence with strategic intent.", price: 11 },
        { id: "creator-personal-brand-workbook", title: "Personal Brand Workbook", category: "creator", description: "Clarify positioning and brand communication.", price: 14 },

        { id: "bundle-ultimate-student-success", title: "Ultimate Student Success Bundle", category: "study", description: "Premium launch bundle for study systems and performance.", price: 30, salePrice: 15, saleLabel: "Launch Sale", featuredSale: true, isNew: true },
        { id: "bundle-complete-career-toolkit", title: "Complete Career Toolkit", category: "career", description: "All-in-one toolkit for resumes, interviews, and applications.", price: 30, salePrice: 15, saleLabel: "Launch Sale", featuredSale: true, isNew: true },
        { id: "bundle-business-starter-toolkit", title: "Business Starter Toolkit", category: "analytics", description: "Foundational templates for business metrics and operations.", price: 30, salePrice: 15, saleLabel: "Launch Sale", featuredSale: true, isNew: true },
        { id: "bundle-productivity-mega", title: "Productivity Mega Bundle", category: "creator", description: "High-leverage productivity templates for execution speed.", price: 30, salePrice: 15, saleLabel: "Launch Sale", featuredSale: true, isNew: true }
    ].map((item) => {
        const lowered = item.title.toLowerCase();
        const inferredType = typeByKeyword.find((entry) => lowered.includes(entry.key))?.type || "template";
        const isBundle = item.id.startsWith("bundle-");
        const format = isBundle ? "ZIP Bundle" : (formatByCategory[item.category] || "PDF");
        const hashSeed = Array.from(item.id).reduce((total, character) => total + character.charCodeAt(0), 0);
        const rating = Math.min(5, Math.max(4.4, 4.5 + ((hashSeed % 6) * 0.1)));
        const reviewCount = 18 + (hashSeed % 142);

        return {
            rating: Number(rating.toFixed(1)),
            reviewCount,
            createdAt: item.isNew ? "2026-07-01" : "2026-06-01",
            collectionLabel: collections[item.category] || "General",
            productType: isBundle ? "bundle" : inferredType,
            fileFormat: format,
            readingTime: isBundle ? "45 min read" : "20 min read",
            instantDownload: true,
            lifetimeUpdates: Boolean(isBundle || item.price >= 14),
            isBundle,
            includes: isBundle
                ? ["Complete toolkit pack", "Checklist bundle", "Editable templates"]
                : ["Download file", "Action checklist", "Quick-start guide"],
            creator: "Created by Anngel Jacobs",
            ...item
        };
    });

    window.SHOP_COLLECTIONS = collections;
    window.SHOP_PRODUCTS = products;
})();
