(() => {
	const categoryMap = document.querySelector(".services-category-map");
	if (!categoryMap) {
		return;
	}

	const select = categoryMap.querySelector(".services-category-select");
	if (!select) {
		return;
	}

	const options = Array.from(select.querySelectorAll("option[value]"));
	const validIds = new Set();
	const sections = [];

	for (const option of options) {
		const id = option.value;
		if (!id) {
			continue;
		}

		const section = document.getElementById(id);
		if (!section) {
			continue;
		}

		validIds.add(id);
		sections.push(section);
	}

	if (sections.length === 0) {
		return;
	}

	const setActive = (id) => {
		if (!validIds.has(id)) {
			return;
		}

		select.value = id;
	};

	select.addEventListener("change", () => {
		const id = select.value;
		if (!id) {
			return;
		}

		const section = document.getElementById(id);
		if (!section) {
			return;
		}

		section.scrollIntoView({ behavior: "smooth", block: "start" });
		window.history.replaceState(null, "", `#${id}`);
		setActive(id);
	});

	const visibleSections = new Map();
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					visibleSections.set(entry.target.id, entry.intersectionRatio);
				} else {
					visibleSections.delete(entry.target.id);
				}
			}

			if (visibleSections.size === 0) {
				return;
			}

			let activeId = null;
			let highestRatio = 0;

			for (const [id, ratio] of visibleSections.entries()) {
				if (ratio > highestRatio) {
					highestRatio = ratio;
					activeId = id;
				}
			}

			if (activeId) {
				setActive(activeId);
			}
		},
		{
			rootMargin: "-30% 0px -55% 0px",
			threshold: [0.2, 0.35, 0.5, 0.7]
		}
	);

	for (const section of sections) {
		observer.observe(section);
	}

	const startingHash = window.location.hash.replace("#", "");
	if (startingHash && validIds.has(startingHash)) {
		setActive(startingHash);
	} else {
		setActive(sections[0].id);
	}
})();

(() => {
	const searchInput = document.getElementById("resource-search");
	const chipButtons = Array.from(document.querySelectorAll(".resource-chip[data-filter]"));
	const recommendedGrid = document.getElementById("recommended-library-grid");
	const healthGrid = document.getElementById("health-library-grid");
	const favoriteGrid = document.getElementById("favorite-library-grid");
	const recommendedSection = document.getElementById("recommended-learning");
	const healthSection = document.getElementById("health-performance");
	const favoritesSection = document.getElementById("favorite-resources");
	const emptyState = document.getElementById("recommended-empty-state");

	if (!searchInput || chipButtons.length === 0 || !recommendedGrid || !healthGrid || !favoriteGrid || !recommendedSection || !healthSection || !favoritesSection || !emptyState) {
		return;
	}

	const resources = [
		{ title: "MDN Web Docs", description: "The most reliable reference for HTML, CSS, JavaScript, and modern web APIs.", categoryKey: "programming", categoryLabel: "Programming & Software Development", difficulty: "Beginner", cost: "Free", url: "https://developer.mozilla.org/", tags: ["javascript", "web", "standards"], recommendation: "Industry Standard", section: "recommended", favorite: true },
		{ title: "freeCodeCamp", description: "A project-based platform for building coding fundamentals through guided exercises.", categoryKey: "programming", categoryLabel: "Programming & Software Development", difficulty: "Beginner", cost: "Free", url: "https://www.freecodecamp.org/", tags: ["projects", "javascript", "curriculum"], recommendation: "Great Starting Point", section: "recommended" },
		{ title: "Harvard CS50", description: "A rigorous introduction to computer science with practical problem-solving depth.", categoryKey: "programming", categoryLabel: "Programming & Software Development", difficulty: "Intermediate", cost: "Free", url: "https://cs50.harvard.edu/", tags: ["computer science", "foundations", "problem solving"], recommendation: "Highly Recommended", section: "recommended", favorite: true },
		{ title: "The Odin Project", description: "A full-stack learning path with strong emphasis on hands-on portfolio work.", categoryKey: "programming", categoryLabel: "Programming & Software Development", difficulty: "Intermediate", cost: "Free", url: "https://www.theodinproject.com/", tags: ["full stack", "portfolio", "javascript"], recommendation: "Great Starting Point", section: "recommended" },
		{ title: "Roadmap.sh", description: "Clear visual roadmaps that help you plan skills in software roles and domains.", categoryKey: "programming", categoryLabel: "Programming & Software Development", difficulty: "Beginner", cost: "Free", url: "https://roadmap.sh/", tags: ["career", "planning", "skills"], recommendation: "Beginner Friendly", section: "recommended" },
		{ title: "DevDocs", description: "Fast unified documentation search across major programming tools and frameworks.", categoryKey: "programming", categoryLabel: "Programming & Software Development", difficulty: "Intermediate", cost: "Free", url: "https://devdocs.io/", tags: ["documentation", "reference", "developer tools"], section: "recommended" },

		{ title: "GeeksforGeeks", description: "A broad knowledge base for data structures, algorithms, and coding interview practice.", categoryKey: "computer-science", categoryLabel: "Computer Science", difficulty: "Intermediate", cost: "Free", url: "https://www.geeksforgeeks.org/", tags: ["algorithms", "interviews", "dsa"], section: "recommended" },
		{ title: "VisuAlgo", description: "Interactive visualizations for understanding core algorithms and data structures step-by-step.", categoryKey: "computer-science", categoryLabel: "Computer Science", difficulty: "Beginner", cost: "Free", url: "https://visualgo.net/", tags: ["visual learning", "algorithms", "dsa"], recommendation: "Beginner Friendly", section: "recommended" },
		{ title: "Big-O Cheat Sheet", description: "A quick complexity guide to compare algorithm performance and trade-offs.", categoryKey: "computer-science", categoryLabel: "Computer Science", difficulty: "Beginner", cost: "Free", url: "https://www.bigocheatsheet.com/", tags: ["complexity", "algorithms", "reference"], section: "recommended" },
		{ title: "CS50 Notes", description: "Concise supporting notes that reinforce CS50 concepts and implementation patterns.", categoryKey: "computer-science", categoryLabel: "Computer Science", difficulty: "Intermediate", cost: "Free", url: "https://cs50.harvard.edu/x/notes/", tags: ["cs50", "study", "concepts"], section: "recommended" },

		{ title: "Cisco Skills for All", description: "Structured beginner tracks for networking, cybersecurity, and IT fundamentals.", categoryKey: "networking", categoryLabel: "Networking & IT", difficulty: "Beginner", cost: "Free", url: "https://skillsforall.com/", tags: ["networking", "it", "certification"], recommendation: "Great Starting Point", section: "recommended", favorite: true },
		{ title: "Cisco Learning Network", description: "Community-driven guidance and resources for networking certification prep.", categoryKey: "networking", categoryLabel: "Networking & IT", difficulty: "Intermediate", cost: "Free", url: "https://learningnetwork.cisco.com/", tags: ["ccna", "community", "networking"], section: "recommended" },
		{ title: "Packet Tracer Academy", description: "Simulation-based practice environment for designing and troubleshooting networks.", categoryKey: "networking", categoryLabel: "Networking & IT", difficulty: "Beginner", cost: "Free", url: "https://www.netacad.com/courses/packet-tracer", tags: ["simulation", "network labs", "packet tracer"], recommendation: "Beginner Friendly", section: "recommended" },
		{ title: "Microsoft Learn Networking", description: "Role-based modules for cloud, infrastructure, and enterprise networking skills.", categoryKey: "networking", categoryLabel: "Networking & IT", difficulty: "Intermediate", cost: "Free", url: "https://learn.microsoft.com/en-us/training/browse/?terms=networking", tags: ["microsoft", "cloud", "networking"], section: "recommended" },

		{ title: "Khan Academy", description: "Clear foundational lessons across algebra, calculus, statistics, and beyond.", categoryKey: "mathematics", categoryLabel: "Mathematics", difficulty: "Beginner", cost: "Free", url: "https://www.khanacademy.org/", tags: ["math", "foundations", "practice"], recommendation: "Beginner Friendly", section: "recommended", favorite: true },
		{ title: "Paul's Online Math Notes", description: "Straightforward notes and examples that simplify complex math topics.", categoryKey: "mathematics", categoryLabel: "Mathematics", difficulty: "Intermediate", cost: "Free", url: "https://tutorial.math.lamar.edu/", tags: ["calculus", "algebra", "reference"], section: "recommended" },
		{ title: "3Blue1Brown", description: "Concept-driven visual explanations that build real mathematical intuition.", categoryKey: "mathematics", categoryLabel: "Mathematics", difficulty: "Intermediate", cost: "Free", url: "https://www.3blue1brown.com/", tags: ["visual", "linear algebra", "intuition"], recommendation: "My Favorite", section: "recommended" },
		{ title: "Desmos", description: "A powerful interactive graphing calculator for exploring functions and models.", categoryKey: "mathematics", categoryLabel: "Mathematics", difficulty: "Beginner", cost: "Free", url: "https://www.desmos.com/", tags: ["graphing", "visualization", "math tools"], section: "recommended" },

		{ title: "Microsoft Learn", description: "Professional learning paths for data, cloud, AI, and enterprise tooling.", categoryKey: "analytics", categoryLabel: "Data Analytics & Business Intelligence", difficulty: "Beginner", cost: "Free", url: "https://learn.microsoft.com/", tags: ["analytics", "data", "microsoft"], recommendation: "Industry Standard", section: "recommended", favorite: true },
		{ title: "Power BI Learning", description: "Official guidance for building dashboards, reports, and business insights.", categoryKey: "analytics", categoryLabel: "Data Analytics & Business Intelligence", difficulty: "Intermediate", cost: "Free", url: "https://learn.microsoft.com/en-us/training/powerplatform/power-bi", tags: ["power bi", "dashboards", "business intelligence"], section: "recommended" },
		{ title: "Kaggle", description: "Datasets and competitions that sharpen practical analytics and ML workflows.", categoryKey: "analytics", categoryLabel: "Data Analytics & Business Intelligence", difficulty: "Intermediate", cost: "Free", url: "https://www.kaggle.com/", tags: ["data science", "machine learning", "projects"], section: "recommended" },
		{ title: "SQLBolt", description: "Beginner-friendly SQL tutorials with interactive exercises and quick feedback.", categoryKey: "analytics", categoryLabel: "Data Analytics & Business Intelligence", difficulty: "Beginner", cost: "Free", url: "https://sqlbolt.com/", tags: ["sql", "databases", "practice"], recommendation: "Great Starting Point", section: "recommended" },

		{ title: "LinkedIn Learning", description: "High-quality professional courses across technology, leadership, and communication.", categoryKey: "career", categoryLabel: "Career Development", difficulty: "Beginner", cost: "Paid", url: "https://www.linkedin.com/learning/", tags: ["career", "professional development", "courses"], section: "recommended" },
		{ title: "GitHub Skills", description: "Hands-on labs for Git workflows, collaboration, and project best practices.", categoryKey: "career", categoryLabel: "Career Development", difficulty: "Beginner", cost: "Free", url: "https://skills.github.com/", tags: ["git", "portfolio", "collaboration"], section: "recommended" },
		{ title: "Resume Worded", description: "Actionable resume and LinkedIn feedback to improve positioning and impact.", categoryKey: "career", categoryLabel: "Career Development", difficulty: "Beginner", cost: "Paid", url: "https://resumeworded.com/", tags: ["resume", "linkedin", "job search"], section: "recommended" },
		{ title: "Levels.fyi", description: "Transparent compensation data for evaluating offers and planning growth.", categoryKey: "career", categoryLabel: "Career Development", difficulty: "Intermediate", cost: "Free", url: "https://www.levels.fyi/", tags: ["salary", "negotiation", "career"], recommendation: "Highly Recommended", section: "recommended" },

		{ title: "Figma Learn", description: "Official learning content for UI design systems, components, and collaboration.", categoryKey: "design", categoryLabel: "UI / UX & Design", difficulty: "Beginner", cost: "Free", url: "https://help.figma.com/hc/en-us/categories/360002042553-Get-started", tags: ["ui", "ux", "figma"], recommendation: "Beginner Friendly", section: "recommended" },
		{ title: "Refactoring UI", description: "Practical design heuristics to make interfaces cleaner and more polished.", categoryKey: "design", categoryLabel: "UI / UX & Design", difficulty: "Intermediate", cost: "Paid", url: "https://www.refactoringui.com/", tags: ["ui", "visual design", "product design"], section: "recommended" },
		{ title: "Google Material Design", description: "System-level guidance for accessibility, interaction, and visual consistency.", categoryKey: "design", categoryLabel: "UI / UX & Design", difficulty: "Intermediate", cost: "Free", url: "https://m3.material.io/", tags: ["design systems", "components", "material"], section: "recommended" },

		{ title: "WebAIM", description: "Practical accessibility articles and testing resources for inclusive websites.", categoryKey: "accessibility", categoryLabel: "Accessibility & Web Standards", difficulty: "Beginner", cost: "Free", url: "https://webaim.org/", tags: ["accessibility", "wcag", "web standards"], recommendation: "Industry Standard", section: "recommended" },
		{ title: "W3C", description: "Authoritative web standards that shape semantic, interoperable web development.", categoryKey: "accessibility", categoryLabel: "Accessibility & Web Standards", difficulty: "Advanced", cost: "Free", url: "https://www.w3.org/", tags: ["web standards", "html", "css"], section: "recommended" },
		{ title: "WCAG Quick Reference", description: "A practical checklist to align content and interfaces with accessibility criteria.", categoryKey: "accessibility", categoryLabel: "Accessibility & Web Standards", difficulty: "Intermediate", cost: "Free", url: "https://www.w3.org/WAI/WCAG22/quickref/", tags: ["wcag", "audit", "inclusive design"], section: "recommended" },

		{ title: "OpenAI Documentation", description: "Core concepts, API usage, and implementation patterns for AI applications.", categoryKey: "ai", categoryLabel: "AI & Productivity", difficulty: "Intermediate", cost: "Free", url: "https://platform.openai.com/docs/", tags: ["ai", "api", "productivity"], section: "recommended" },
		{ title: "Anthropic Prompt Library", description: "Prompt examples and patterns for practical, high-quality model interactions.", categoryKey: "ai", categoryLabel: "AI & Productivity", difficulty: "Beginner", cost: "Free", url: "https://docs.anthropic.com/en/prompt-library/library", tags: ["ai", "prompting", "workflow"], section: "recommended" },
		{ title: "Notion Guides", description: "Templates and workflows for organizing projects, notes, and personal systems.", categoryKey: "ai", categoryLabel: "AI & Productivity", difficulty: "Beginner", cost: "Free", url: "https://www.notion.com/help/guides", tags: ["productivity", "knowledge management", "planning"], section: "recommended" },
		{ title: "Obsidian Help", description: "A strong reference for building linked notes and long-term learning systems.", categoryKey: "ai", categoryLabel: "AI & Productivity", difficulty: "Beginner", cost: "Free", url: "https://help.obsidian.md/", tags: ["notes", "productivity", "pkm"], section: "recommended" },

		{ title: "Mayo Clinic", description: "Trusted medical information for symptoms, conditions, and preventive care.", categoryKey: "health", categoryLabel: "General Health", difficulty: "Beginner", cost: "Free", url: "https://www.mayoclinic.org/", tags: ["health", "wellness", "evidence"], section: "health" },
		{ title: "Cleveland Clinic", description: "Comprehensive health education from a leading clinical care institution.", categoryKey: "health", categoryLabel: "General Health", difficulty: "Beginner", cost: "Free", url: "https://my.clevelandclinic.org/health", tags: ["health", "medical", "wellness"], section: "health" },
		{ title: "MedlinePlus", description: "Reliable public health information curated by the U.S. National Library of Medicine.", categoryKey: "health", categoryLabel: "General Health", difficulty: "Beginner", cost: "Free", url: "https://medlineplus.gov/", tags: ["health", "education", "medical"], section: "health" },

		{ title: "Renaissance Periodization", description: "Structured training and nutrition frameworks for long-term physique progress.", categoryKey: "fitness", categoryLabel: "Strength & Fitness", difficulty: "Intermediate", cost: "Paid", url: "https://rpstrength.com/", tags: ["fitness", "nutrition", "periodization"], recommendation: "Highly Recommended", section: "health" },
		{ title: "ExRx Exercise Library", description: "A practical exercise reference with movement guidance and muscle targeting.", categoryKey: "fitness", categoryLabel: "Strength & Fitness", difficulty: "Beginner", cost: "Free", url: "https://exrx.net/", tags: ["fitness", "exercise library", "strength"], section: "health" },

		{ title: "USA Volleyball", description: "Skill development, drills, and training resources for volleyball athletes and coaches.", categoryKey: "fitness", categoryLabel: "Sports Performance", difficulty: "Intermediate", cost: "Free", url: "https://usavolleyball.org/", tags: ["sports", "volleyball", "performance", "fitness"], section: "health" },
		{ title: "USA Basketball", description: "Official training and development pathways for basketball fundamentals and growth.", categoryKey: "fitness", categoryLabel: "Sports Performance", difficulty: "Intermediate", cost: "Free", url: "https://www.usab.com/", tags: ["sports", "basketball", "performance", "fitness"], section: "health" },
		{ title: "FIFA Training Centre", description: "Elite football training insights, drills, and coaching resources for performance.", categoryKey: "fitness", categoryLabel: "Sports Performance", difficulty: "Advanced", cost: "Free", url: "https://www.fifatrainingcentre.com/", tags: ["sports", "soccer", "performance", "fitness"], section: "health" },
		{ title: "USTA Player Development", description: "Tennis development resources for training progress, performance, and discipline.", categoryKey: "fitness", categoryLabel: "Sports Performance", difficulty: "Intermediate", cost: "Free", url: "https://www.usta.com/en/home/play/player-development.html", tags: ["sports", "tennis", "performance", "fitness"], section: "health" },

		{ title: "Precision Nutrition", description: "Coaching-centered nutrition education grounded in behavior and long-term sustainability.", categoryKey: "health", categoryLabel: "Nutrition", difficulty: "Beginner", cost: "Paid", url: "https://www.precisionnutrition.com/", tags: ["nutrition", "health", "habits"], section: "health" },
		{ title: "Examine.com", description: "Research summaries that translate nutrition and supplement evidence into clear guidance.", categoryKey: "health", categoryLabel: "Nutrition", difficulty: "Intermediate", cost: "Paid", url: "https://examine.com/", tags: ["nutrition", "supplements", "health"], section: "health" },

		{ title: "Squat University", description: "Mobility, movement quality, and injury-prevention education for safer training.", categoryKey: "fitness", categoryLabel: "Mobility & Recovery", difficulty: "Intermediate", cost: "Free", url: "https://squatuniversity.com/", tags: ["mobility", "recovery", "fitness", "health"], section: "health" },
		{ title: "The Ready State", description: "Guided protocols for mobility, recovery, and sustainable athletic performance.", categoryKey: "fitness", categoryLabel: "Mobility & Recovery", difficulty: "Intermediate", cost: "Paid", url: "https://thereadystate.com/", tags: ["mobility", "recovery", "fitness", "health"], section: "health" }
	];

	const makeCard = (resource, isFavoriteCard = false) => {
		const card = document.createElement("article");
		card.className = "knowledge-card";
		if (isFavoriteCard) {
			card.classList.add("favorite-highlight");
		}

		const recommendationBadge = resource.recommendation
			? `<span class="knowledge-badge is-recommendation">${resource.recommendation}</span>`
			: "";

		card.innerHTML = `
			<div>
				<div class="knowledge-card-title-row">
					<h3>${resource.title}</h3>
					<span aria-hidden="true" class="external-link-icon">&#8599;</span>
				</div>
				<p class="knowledge-card-description">${resource.description}</p>
				<div class="knowledge-badge-row">
					<span class="knowledge-badge">${resource.categoryLabel}</span>
					<span class="knowledge-badge is-difficulty">${resource.difficulty}</span>
					<span class="knowledge-badge is-cost">${resource.cost}</span>
					${recommendationBadge}
				</div>
			</div>
			<a href="${resource.url}" class="knowledge-card-action" target="_blank" rel="noopener noreferrer">Visit Resource <span aria-hidden="true" class="external-link-icon">&#8599;</span></a>
		`;

		return card;
	};

	const recommendedEntries = [];
	const healthEntries = [];
	const favoriteEntries = [];

	for (const resource of resources) {
		if (resource.section === "recommended") {
			const card = makeCard(resource);
			recommendedGrid.appendChild(card);
			recommendedEntries.push({ resource, card });
		}

		if (resource.section === "health") {
			const card = makeCard(resource);
			healthGrid.appendChild(card);
			healthEntries.push({ resource, card });
		}

		if (resource.favorite) {
			const card = makeCard(resource, true);
			favoriteGrid.appendChild(card);
			favoriteEntries.push({ resource, card });
		}
	}

	let activeFilter = chipButtons.find((button) => button.classList.contains("is-active"))?.dataset.filter || "all";
	const visibleCardLimit = 6;

	const setGridScrollState = (grid) => {
		const visibleCards = Array.from(grid.querySelectorAll(".knowledge-card:not([hidden])"));

		if (visibleCards.length <= visibleCardLimit) {
			grid.classList.remove("has-internal-scroll");
			grid.style.maxHeight = "";
			return;
		}

		const limitedCards = visibleCards.slice(0, visibleCardLimit);
		const firstTop = limitedCards[0].offsetTop;
		const maxBottom = Math.max(...limitedCards.map((card) => card.offsetTop + card.offsetHeight));
		const maxHeight = Math.ceil(maxBottom - firstTop);

		grid.style.maxHeight = `${maxHeight}px`;
		grid.classList.add("has-internal-scroll");
	};

	const updateScrollableGrids = () => {
		setGridScrollState(recommendedGrid);
		setGridScrollState(healthGrid);
		setGridScrollState(favoriteGrid);
	};


	const matchesSearch = (resource, query) => {
		if (!query) {
			return true;
		}

		const searchable = [
			resource.title,
			resource.description,
			resource.categoryLabel,
			resource.categoryKey,
			resource.tags.join(" "),
			resource.recommendation || ""
		].join(" ").toLowerCase();

		return searchable.includes(query);
	};

	const matchesFilter = (resource, filter) => {
		if (filter === "all") {
			return true;
		}

		if (filter === "favorites") {
			return Boolean(resource.favorite);
		}

		if (filter === "fitness") {
			return resource.categoryKey === "fitness" || resource.tags.includes("fitness");
		}

		if (filter === "health") {
			return resource.categoryKey === "health" || resource.tags.includes("health");
		}

		return resource.categoryKey === filter;
	};

	const applyFilters = () => {
		const query = searchInput.value.trim().toLowerCase();
		let recommendedVisible = 0;
		let healthVisible = 0;
		let favoriteVisible = 0;
		const showHealthSection = activeFilter === "health" || activeFilter === "fitness";

		for (const entry of recommendedEntries) {
			const visible = activeFilter !== "favorites" && matchesSearch(entry.resource, query) && matchesFilter(entry.resource, activeFilter);
			entry.card.hidden = !visible;
			if (visible) {
				recommendedVisible += 1;
			}
		}

		for (const entry of healthEntries) {
			const visible = showHealthSection && activeFilter !== "favorites" && matchesSearch(entry.resource, query) && matchesFilter(entry.resource, activeFilter);
			entry.card.hidden = !visible;
			if (visible) {
				healthVisible += 1;
			}
		}

		for (const entry of favoriteEntries) {
			const visible = (activeFilter === "favorites") && matchesSearch(entry.resource, query);
			entry.card.hidden = !visible;
			if (visible) {
				favoriteVisible += 1;
			}
		}

		recommendedSection.hidden = activeFilter === "favorites" || recommendedVisible === 0;
		healthSection.hidden = !showHealthSection || healthVisible === 0;
		favoritesSection.hidden = activeFilter !== "favorites";

		if (!favoritesSection.hidden && favoriteVisible === 0) {
			favoritesSection.hidden = true;
		}

		updateScrollableGrids();
		emptyState.hidden = recommendedVisible + healthVisible + favoriteVisible > 0;
	};

	for (const chip of chipButtons) {
		chip.addEventListener("click", () => {
			activeFilter = chip.dataset.filter || "all";
			for (const button of chipButtons) {
				button.classList.toggle("is-active", button === chip);
			}
			applyFilters();
		});
	}

	searchInput.addEventListener("input", applyFilters);
	window.addEventListener("resize", updateScrollableGrids);
	applyFilters();
})();

(() => {
	const header = document.querySelector(".site-header");
	if (!header) {
		return;
	}

	const button = document.createElement("button");
	button.type = "button";
	button.className = "scroll-top-button";
	button.setAttribute("aria-label", "Scroll back to top");
	button.innerHTML = '<span aria-hidden="true">&#8593;</span>';
	document.body.appendChild(button);

	const updateVisibility = () => {
		const headerRect = header.getBoundingClientRect();
		const headerIsFullyOutOfView = headerRect.bottom <= 0 || headerRect.top >= window.innerHeight;

		button.classList.toggle("is-visible", headerIsFullyOutOfView);
	};

	button.addEventListener("click", () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	});

	window.addEventListener("scroll", updateVisibility, { passive: true });
	window.addEventListener("resize", updateVisibility);
	updateVisibility();
})();
