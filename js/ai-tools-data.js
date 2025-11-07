const aiToolsData = {
  writing: [
    { name: "ChatGPT", url: "https://chat.openai.com/" },
    { name: "Google Gemini", url: "https://gemini.google.com/" },
    { name: "Perplexity AI", url: "https://www.perplexity.ai/" },
    { name: "QuillBot", url: "https://quillbot.com/" },
    { name: "Notion AI", url: "https://www.notion.so/product/ai" },
  ],
  image: [
    { name: "Midjourney", url: "https://www.midjourney.com/" },
    { name: "DALL-E 3", url: "https://www.bing.com/images/create" },
    { name: "Leonardo.Ai", url: "https://leonardo.ai/" },
    { name: "Adobe Firefly", url: "https://www.adobe.com/sensei/generative-ai/firefly.html" },
    { name: "Stable Diffusion", url: "https://stablediffusionweb.com/" },
  ],
  code: [
    { name: "GitHub Copilot", url: "https://github.com/features/copilot" },
    { name: "Tabnine", url: "https://www.tabnine.com/" },
    { name: "Replit Ghostwriter", url: "https://replit.com/ghostwriter" },
    { name: "Amazon CodeWhisperer", url: "https://aws.amazon.com/codewhisperer/" },
    { name: "Blackbox AI", url: "https://www.blackbox.ai/" },
  ],
  videoAudio: [
    { name: "RunwayML", url: "https://runwayml.com/" },
    { name: "Descript", url: "https://www.descript.com/" },
    { name: "ElevenLabs", url: "https://elevenlabs.io/" },
    { name: "Adobe Podcast", url: "https://podcast.adobe.com/" },
    { name: "Synthesia", url: "https://www.synthesia.io/" },
  ],
  productivity: [
    { name: "Consensus", url: "https://consensus.app/" },
    { name: "Elicit.org", url: "https://elicit.org/" },
    { name: "SciSpace", url: "https://typeset.io/" },
    { name: "Gamma", url: "https://gamma.app/" },
    { name: "Tome", url: "https://tome.app/" },
  ],
};

/**
 * Generates a URL for a website's logo using a third-party service.
 * @param {string} domain The domain of the website (e.g., "openai.com").
 * @returns {string} The URL of the logo.
 */
function getLogoUrl(domain) {
  return `https://logo.clearbit.com/${domain}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const aiToolsContainer = document.getElementById("ai-tools-container");
  if (!aiToolsContainer) return;

  const createSection = (title, sites) => {
    const section = document.createElement("div");
    // Reusing the 'career-section' and 'club-header' classes for consistent styling
    section.className = "career-section";

    const siteLinks = sites
      .map((site) => {
        const domain = new URL(site.url).hostname.replace("www.", "");
        return `
          <a href="${site.url}" target="_blank" class="portal-link-item">
            <img src="${getLogoUrl(domain)}" alt="${site.name} Logo" class="portal-logo" onerror="this.style.display='none'">
            <span class="portal-name">${site.name}</span>
            <i class="fas fa-external-link-alt"></i>
          </a>
        `;
      })
      .join("");

    section.innerHTML = `
      <button class="club-header">
        <span class="club-name">${title}</span>
        <i class="fas fa-chevron-down collapse-icon"></i>
      </button>
      <div class="club-details-content portal-links-grid">
        ${siteLinks}
      </div>
    `;
    return section;
  };

  const sections = [
    { title: "Text & Writing Assistants", data: aiToolsData.writing },
    { title: "Image Generation", data: aiToolsData.image },
    { title: "Code & Development", data: aiToolsData.code },
    { title: "Video & Audio Tools", data: aiToolsData.videoAudio },
    { title: "Productivity & Research", data: aiToolsData.productivity },
  ];

  sections.forEach(sec => {
    aiToolsContainer.appendChild(createSection(sec.title, sec.data));
  });

  // Add collapsible functionality
  aiToolsContainer.addEventListener("click", (e) => {
    const header = e.target.closest(".club-header");
    if (header) {
      const section = header.parentElement;
      section.classList.toggle("active");
    }
  });
});