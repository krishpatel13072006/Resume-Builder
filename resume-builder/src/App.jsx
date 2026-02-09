
import React, { useState, useRef, useEffect } from 'react';
import { Phone, Mail, MapPin, Trash2, Globe, Github, Linkedin, Moon, Sun } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import LoadingSpinner from './components/LoadingSpinner';
import { suggestSkills, suggestBulletPoints, generateSummary, improveContent } from './api/genai';



const getLightColor = (hex, opacity = 0.2) => {
  // Simple hex to rgba converter for consistent transparency
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const App = () => {
  const resumeRef = useRef();
  const [accentColor, setAccentColor] = useState('#2D3E50');
  const [leftPanelColor, setLeftPanelColor] = useState('#E8DCC4');
  const [rightPanelColor, setRightPanelColor] = useState('#FFFFFF');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentView, setCurrentView] = useState('gallery');
  const [selectedFont, setSelectedFont] = useState('Roboto');

  const [zoom, setZoom] = useState(0.9);

  const [showGuidance, setShowGuidance] = useState(false);

  // AI Demo State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // AI Suggestions State
  const [apiKey, setApiKey] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [improveInput, setImproveInput] = useState('');
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [suggestedBullets, setSuggestedBullets] = useState([]);
  const [summaryText, setSummaryText] = useState('');
  const [improvedText, setImprovedText] = useState('');
  const [aiSuggestionLoading, setAiSuggestionLoading] = useState(false);



  // Font options corresponding to what you loaded in index.html
  const fontOptions = [
    { name: 'Modern Sans', value: 'Roboto' },
    { name: 'Clean Sans', value: 'Open Sans' },
    { name: 'Friendly', value: 'Lato' },
    { name: 'Geometric', value: 'Montserrat' },
    { name: 'Elegant', value: 'Raleway' },
    { name: 'Classic Serif', value: 'Merriweather' },
    { name: 'Luxury Serif', value: 'Playfair Display' },
    { name: 'Editorial', value: 'Lora' },
    { name: 'Humanist', value: 'PT Serif' },
    { name: 'Trendy', value: 'Poppins' },
    { name: 'Contemporary', value: 'Inter' },
    { name: 'Rounded', value: 'Nunito' },
    { name: 'Professional', value: 'Source Sans Pro' },
    { name: 'Ubuntu', value: 'Ubuntu' },
    { name: 'Bold Display', value: 'Oswald' },
    { name: 'Classic Roman', value: 'Cinzel' },
    { name: 'Book Serif', value: 'Crimson Text' },
    { name: 'Minimalist', value: 'Josefin Sans' },
    { name: 'Soft Rounded', value: 'Quicksand' },
    { name: 'Modern Work', value: 'Work Sans' }
  ];

  const [previewName, setPreviewName] = useState('Your Name');




  const colorOptions = [
    { name: 'Navy', hex: '#2D3E50' },
    { name: 'Black', hex: '#000000' },
    { name: 'Blue', hex: '#1E40AF' },
    { name: 'Green', hex: '#166534' },
    { name: 'Red', hex: '#B91C1C' },
    { name: 'Purple', hex: '#6B21A8' },
    { name: 'Orange', hex: '#B45309' },
    { name: 'Teal', hex: '#0D9488' }
  ];

  const panelColorOptions = [
    { name: 'Beige', hex: '#E8DCC4' },
    { name: 'Light Gray', hex: '#F3F4F6' },
    { name: 'Cream', hex: '#FFFBF0' },
    { name: 'Light Blue', hex: '#E0F2FE' },
    { name: 'Light Green', hex: '#F0FDF4' },
    { name: 'Light Purple', hex: '#FAF5FF' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Off White', hex: '#FAFAF9' }
  ];

  const colors = {
    sidebarBg: "bg-[#E8DCC4]"
  };

  const [formData, setFormData] = useState({
    name: "KRISH PATEL",
    title: "Job Title",
    about: "Computer Engineering student at Apollo Institute. Focused on Java development and React ecosystems.",
    phone: "+91 00000-00000",
    email: "krish.patel@email.com",
    location: "Ahmedabad, Gujarat",
    photo: null,
    links: {
      github: "github.com/krishpatel",
      linkedin: "linkedin.com/in/krishpatel",
      portfolio: "krish-dev.vercel.app"
    },
    // Formal roles only
    experience: [
      {
        id: 1,
        company: "Tata Consultancy Services (TCS)",
        position: "Engineering Intern",
        years: "Summer 2025",
        description: "Assisted in building internal tools using Java and React, wrote unit tests, and collaborated with senior engineers on code reviews."
      }
    ],
    // Independent / personal builds
    projects: [
      {
        id: 1,
        title: "Resume Creator",

        tech: "React, Tailwind CSS, jsPDF",
        years: "2026",
        description: "Built a dynamic resume builder with live preview and PDF export."
      }
    ],
    education: [
      {
        id: 1,
        institution: "Apollo Institute of Engineering and Technology",
        degree: "Bachelor of Engineering (Computer Engineering)",
        years: "2024 - 2028",
        percentage: "82%",
        cgpa: "8.4",
        details: "Focused on Java development and Database Management."
      }
    ],
    certifications: [
      { id: 1, title: "Java Programming Certificate", org: "Oracle", year: "2025" }
    ],
    techSkills: {
      languages: ["Java", "JavaScript", "C"],
      frameworks: ["React.js", "Tailwind CSS", "Node.js"],
      tools: ["Git", "GitHub", "VS Code", "Vercel"]
    },
    languages: ["English", "Hindi", "Gujarati"],
    expertise: ["Project Management", "UI/UX Design", "Critical Thinking"]
  });

  // 1. Load saved data when the app starts
  useEffect(() => {
    const savedData = localStorage.getItem("resume_data");
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  // 2. Auto-save data whenever formData changes
  useEffect(() => {
    // Debounce slightly to avoid saving on every single keystroke if needed,
    // but for local storage, direct saving is usually fine.
    localStorage.setItem("resume_data", JSON.stringify(formData));
  }, [formData]);

  // Event handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLinksChange = (field, value) => {
    setFormData({
      ...formData,
      links: {
        ...formData.links,
        [field]: value
      }
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, photo: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadPDF = async () => {
    const element = resumeRef.current;

    // Temporarily expand elements for full capture
    const rightPanel = element?.querySelector('#right-panel');
    const resumeContainer = element?.parentElement;
    const originalOverflow = rightPanel?.style.overflow;
    const originalMaxHeight = rightPanel?.style.maxHeight;
    const originalHeight = resumeContainer?.style.height;
    const originalInnerHeight = element?.style.height;

    if (rightPanel) {
      rightPanel.style.overflow = 'visible';
      rightPanel.style.maxHeight = 'none';
    }
    if (resumeContainer) {
      resumeContainer.style.height = 'auto';
    }
    if (element) {
      element.style.height = 'auto';
    }

    try {
      // Wait for layout to update
      await new Promise(resolve => setTimeout(resolve, 200));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 0,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 0;

      // Calculate image dimensions to fit page width
      const imgWidth = pageWidth - (2 * margin);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Calculate number of pages needed
      const totalPages = Math.ceil(imgHeight / pageHeight);

      // Add image to each page with proper offset
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        // Calculate Y position offset for this page
        const yPosition = -(i * pageHeight) + margin;

        // Add the portion of the image for this page
        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight, '', 'FAST');
      }

      pdf.save(`${formData.name}_Resume.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      // Restore original styles
      if (rightPanel) {
        rightPanel.style.overflow = originalOverflow || '';
        rightPanel.style.maxHeight = originalMaxHeight || '';
      }
      if (resumeContainer) {
        resumeContainer.style.height = originalHeight || '';
      }
      if (element) {
        element.style.height = originalInnerHeight || '';
      }
    }
  };

  // Export Data to JSON
  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${formData.name || "resume"}_data.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Import Data from JSON
  const importData = (event) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      try {
        const parsedData = JSON.parse(e.target.result);
        setFormData(parsedData);
        alert("Resume loaded successfully!");
      } catch (error) {
        alert("Invalid file format.");
      }
    };
  };

  // Experience handlers
  const addExperience = () => {
    const newExp = { id: Date.now(), company: "", position: "", years: "", description: "" };
    setFormData({ ...formData, experience: [...formData.experience, newExp] });
  };

  const updateExperience = (id, field, value) => {
    const updatedExp = formData.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp);
    setFormData({ ...formData, experience: updatedExp });
  };

  const deleteExperience = (id) => {
    setFormData({ ...formData, experience: formData.experience.filter(exp => exp.id !== id) });
  };

  // Project handlers
  const addProject = () => {
    const newProj = { id: Date.now(), title: "", tech: "", years: "", description: "" };
    setFormData({ ...formData, projects: [...formData.projects, newProj] });
  };

  const updateProject = (id, field, value) => {
    const updatedProj = formData.projects.map(proj => proj.id === id ? { ...proj, [field]: value } : proj);
    setFormData({ ...formData, projects: updatedProj });
  };

  const deleteProject = (id) => {
    setFormData({ ...formData, projects: formData.projects.filter(proj => proj.id !== id) });
  };

  // Education handlers
  const addEducation = () => {
    const newEdu = { id: Date.now(), institution: "", degree: "", years: "", percentage: "", cgpa: "", details: "" };
    setFormData({ ...formData, education: [...formData.education, newEdu] });
  };

  const updateEducation = (id, field, value) => {
    const updatedEdu = formData.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu);
    setFormData({ ...formData, education: updatedEdu });
  };

  const deleteEducation = (id) => {
    setFormData({ ...formData, education: formData.education.filter(edu => edu.id !== id) });
  };

  // Language handlers
  const handleLanguageChange = (index, value) => {
    const newLanguages = [...formData.languages];
    newLanguages[index] = value;
    setFormData({ ...formData, languages: newLanguages });
  };

  const deleteLanguage = (index) => {
    setFormData({ ...formData, languages: formData.languages.filter((_, i) => i !== index) });
  };

  const addLanguage = () => {
    setFormData({ ...formData, languages: [...formData.languages, "New Language"] });
  };

  // Expertise handlers
  const handleExpertiseChange = (index, value) => {
    const newExpertise = [...formData.expertise];
    newExpertise[index] = value;
    setFormData({ ...formData, expertise: newExpertise });
  };

  const deleteExpertise = (index) => {
    setFormData({ ...formData, expertise: formData.expertise.filter((_, i) => i !== index) });
  };

  const addExpertise = () => {
    setFormData({ ...formData, expertise: [...formData.expertise, "New Skill"] });
  };

  // Certification handlers
  const addCertification = () => {
    const newCert = { id: Date.now(), title: "", org: "", year: "" };
    setFormData({ ...formData, certifications: [...formData.certifications, newCert] });
  };

  const updateCertification = (id, field, value) => {
    const updatedCert = formData.certifications.map(cert => cert.id === id ? { ...cert, [field]: value } : cert);
    setFormData({ ...formData, certifications: updatedCert });
  };

  const deleteCertification = (id) => {
    setFormData({ ...formData, certifications: formData.certifications.filter(cert => cert.id !== id) });
  };

  // Handle blur for contentEditable
  const handleBlur = (field, value, id, subfield) => {
    if (field === 'experience') {
      updateExperience(id, subfield, value);
    } else if (field === 'project') {
      updateProject(id, subfield, value);
    } else if (field === 'certification') {
      updateCertification(id, subfield, value);
    } else if (field === 'education') {
      updateEducation(id, subfield, value);
    } else if (field === 'languages') {
      const newLanguages = [...formData.languages];
      newLanguages[id] = value;
      setFormData({ ...formData, languages: newLanguages });
    } else if (field === 'expertise') {
      const newExpertise = [...formData.expertise];
      newExpertise[id] = value;
      setFormData({ ...formData, expertise: newExpertise });
    } else if (field === 'techSkills') {
      const newTechSkills = { ...formData.techSkills };
      newTechSkills[subfield][id] = value;
      setFormData({ ...formData, techSkills: newTechSkills });
    } else if (field === 'links') {
      setFormData({ ...formData, links: { ...formData.links, [subfield]: value } });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  // AI Suggestion Functions
  const handleSuggestSkills = async () => {
    if (!skillInput.trim()) return;
    setAiSuggestionLoading(true);
    try {
      const skills = await suggestSkills(skillInput, apiKey || undefined);
      setSuggestedSkills(skills);
    } catch (error) {
      alert('Error suggesting skills: ' + error.message);
    } finally {
      setAiSuggestionLoading(false);
    }
  };

  const handleSuggestBullets = async () => {
    if (!roleInput.trim() || !companyInput.trim()) return;
    setAiSuggestionLoading(true);
    try {
      const bullets = await suggestBulletPoints(roleInput, companyInput, apiKey || undefined);
      setSuggestedBullets(bullets);
    } catch (error) {
      alert('Error suggesting bullet points: ' + error.message);
    } finally {
      setAiSuggestionLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setAiSuggestionLoading(true);
    try {
      const summary = await generateSummary(formData, apiKey || undefined);
      setSummaryText(summary);
    } catch (error) {
      alert('Error generating summary: ' + error.message);
    } finally {
      setAiSuggestionLoading(false);
    }
  };

  const handleImproveContent = async () => {
    if (!improveInput.trim()) return;
    setAiSuggestionLoading(true);
    try {
      const improved = await improveContent(improveInput, apiKey || undefined);
      setImprovedText(improved);
    } catch (error) {
      alert('Error improving content: ' + error.message);
    } finally {
      setAiSuggestionLoading(false);
    }
  };

  const addSuggestedSkill = (skill) => {
    const newLanguages = [...formData.techSkills.languages, skill];
    setFormData({ ...formData, techSkills: { ...formData.techSkills, languages: newLanguages } });
  };

  const addSuggestedBullet = (bullet) => {
    const newExp = { id: Date.now(), company: companyInput, position: roleInput, years: "2024 - Present", description: bullet };
    setFormData({ ...formData, experience: [...formData.experience, newExp] });
  };



  // Template Components
  const CreativeGreenTemplate = ({ formData, accentColor, leftPanelColor, rightPanelColor, selectedFont }) => (
    <div className="w-full h-full flex p-0 font-serif" style={{ backgroundColor: rightPanelColor, fontFamily: selectedFont }}>
      {/* LEFT SIDEBAR (Narrow) */}
      <div className="w-[30%] p-6 space-y-6" style={{ backgroundColor: leftPanelColor }}>
        <div className="flex justify-center items-center min-h-[200px] mb-4 px-4">
          {/* Circle Photo Frame */}
          <div className="w-48 h-48 rounded-full overflow-hidden shadow-xl">
            {formData.photo ? (
              <img src={formData.photo} alt="Profile" className="w-full h-full object-cover object-center" />
            ) : (
              <span className="text-xs uppercase font-bold">Photo</span>
            )}
          </div>
        </div>

        <div className="mt-12">
          <h2
            contentEditable={true}
            suppressContentEditableWarning={true}
            onBlur={(e) => handleBlur('name', e.currentTarget.textContent)}
            placeholder="Your Name"
            className="text-3xl font-black text-zinc-800 leading-tight outline-none hover:bg-white/10 p-1"
          >
            {formData.name}
          </h2>
          <p
            contentEditable={true}
            suppressContentEditableWarning={true}
            onBlur={(e) => handleBlur('title', e.currentTarget.textContent)}
            placeholder="Job Title"
            className="text-sm font-bold text-emerald-700 uppercase tracking-widest outline-none hover:bg-white/10 p-1"
          >
            {formData.title}
          </p>
        </div>

        <section>
          <h3 className="text-xs font-bold uppercase border-b border-zinc-300 pb-1 mb-2 text-black">Profile</h3>
          <p
            contentEditable={true}
            suppressContentEditableWarning={true}
            onBlur={(e) => handleBlur('about', e.currentTarget.textContent)}
            placeholder="Computer Engineering student at Apollo Institute. Focused on Java development and React ecosystems."
            className="text-[10px] text-zinc-600 leading-relaxed outline-none hover:bg-white/10 p-1"
          >
            {formData.about}
          </p>
        </section>

        {/* Contact */}
        <section>
          <h3 className="text-xs font-bold uppercase border-b border-zinc-300 pb-1 mb-2 text-black">Contact</h3>
          <div className="space-y-2 text-[10px] text-zinc-600">
            <div className="flex items-center gap-2">
              <Phone size={12} />
              <span
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleBlur('phone', e.currentTarget.textContent)}
                className="outline-none hover:bg-white/10 p-1"
              >
                {formData.phone}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={12} />
              <span
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleBlur('email', e.currentTarget.textContent)}
                className="outline-none hover:bg-white/10 p-1"
              >
                {formData.email}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={12} />
              <span
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleBlur('location', e.currentTarget.textContent)}
                className="outline-none hover:bg-white/10 p-1"
              >
                {formData.location}
              </span>
            </div>
          </div>
        </section>

        {/* Links */}
        {(formData.links?.github || formData.links?.linkedin || formData.links?.portfolio) && (
          <section>
            <h3 className="text-xs font-bold uppercase border-b border-zinc-300 pb-1 mb-2 text-black">Links</h3>
            <div className="space-y-2 text-[10px] text-zinc-600">
              {formData.links?.portfolio && (
                <div className="flex items-center gap-2">
                  <Globe size={12} />
                  <span
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('links', e.currentTarget.textContent, null, 'portfolio')}
                    className="break-all outline-none hover:bg-white/10 p-1"
                  >
                    {formData.links.portfolio}
                  </span>
                </div>
              )}
              {formData.links?.github && (
                <div className="flex items-center gap-2">
                  <Github size={12} />
                  <span
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('links', e.currentTarget.textContent, null, 'github')}
                    className="break-all outline-none hover:bg-white/10 p-1"
                  >
                    {formData.links.github}
                  </span>
                </div>
              )}
              {formData.links?.linkedin && (
                <div className="flex items-center gap-2">
                  <Linkedin size={12} />
                  <span
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('links', e.currentTarget.textContent, null, 'linkedin')}
                    className="break-all outline-none hover:bg-white/10 p-1"
                  >
                    {formData.links.linkedin}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Languages */}
        {formData.languages.length > 0 && (
          <section>
            <h3 className="text-xs font-bold uppercase border-b border-zinc-300 pb-1 mb-2 text-black">Languages</h3>
            <div className="space-y-1 text-[10px] text-zinc-600">
              {formData.languages.map((lang, index) => (
                <div key={lang}>
                  <span
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('languages', e.currentTarget.textContent, index)}
                    className="font-semibold outline-none hover:bg-white/10 p-1"
                  >
                    {lang}
                  </span>
                  : Fluent
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Expertise */}
        {formData.expertise.length > 0 && (
          <section>
            <h3 className="text-xs font-bold uppercase border-b border-zinc-300 pb-1 mb-2 text-black">Expertise</h3>
            <div className="space-y-1 text-[10px] text-zinc-600">
              {formData.expertise.map((exp, index) => (
                <div key={exp}>
                  •
                  <span
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('expertise', e.currentTarget.textContent, index)}
                    className="outline-none hover:bg-white/10 p-1"
                  >
                    {exp}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* MAIN CONTENT (Wide) */}
      <div className="flex-1 p-8 h-full flex flex-col" style={{ backgroundColor: rightPanelColor }}>
        {/* Header */}
        <header className="mb-10" style={{ pageBreakInside: 'avoid' }}>
          <h1
            contentEditable={true}
            suppressContentEditableWarning={true}
            onBlur={(e) => handleBlur('name', e.currentTarget.textContent)}
            className="text-5xl font-black tracking-tight text-black leading-none outline-none hover:bg-white/10 p-1"
          >
            {formData.name}
          </h1>
          <p
            contentEditable={true}
            suppressContentEditableWarning={true}
            onBlur={(e) => handleBlur('title', e.currentTarget.textContent)}
            className="text-sm font-semibold tracking-[0.35em] uppercase mt-3 text-zinc-700 outline-none hover:bg-white/10 p-1"
          >
            {formData.title}
          </p>
        </header>

        {/* Experience (internships / roles) */}
        {formData.experience.length > 0 && (
          <section className="mb-6 mt-2" style={{ pageBreakInside: 'avoid' }}>
            <h2 className="bg-black text-white px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.35em] mb-5 shadow-sm">
              Experience
            </h2>
            <div className="pl-2 space-y-4 mt-2">
              {formData.experience.map((exp) => (
                <div key={exp.id} className="px-1" style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('experience', e.currentTarget.textContent, exp.id, 'position')}
                      className="font-bold text-zinc-800 text-sm outline-none hover:bg-white/10 p-1"
                    >
                      {exp.position}
                    </h4>
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('experience', e.currentTarget.textContent, exp.id, 'years')}
                      className="text-[10px] font-bold text-zinc-400 uppercase outline-none hover:bg-white/10 p-1"
                    >
                      {exp.years}
                    </span>
                  </div>
                  <p
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('experience', e.currentTarget.textContent, exp.id, 'company')}
                    className="text-[11px] text-zinc-500 font-semibold outline-none hover:bg-white/10 p-1"
                  >
                    {exp.company}
                  </p>
                  {exp.description && (
                    <p
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('experience', e.currentTarget.textContent, exp.id, 'description')}
                      className="text-[11px] leading-relaxed text-zinc-600 mt-1 outline-none hover:bg-white/10 p-1"
                    >
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {formData.education.length > 0 && (
          <section className="mb-8 mt-4" style={{ pageBreakInside: 'avoid' }}>
            <h2 className="bg-black text-white px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.35em] mb-6 shadow-sm">
              Education
            </h2>
            <div className="pl-2 space-y-5 mt-2">
              {formData.education.map((edu) => (
                <div key={edu.id} style={{ pageBreakInside: 'avoid' }}>
                  <h4
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'institution')}
                    className="font-bold text-zinc-800 text-base outline-none hover:bg-white/10 p-1"
                  >
                    {edu.institution}
                  </h4>
                  <p className="text-xs text-zinc-500 italic mb-1">
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'degree')}
                      className="outline-none hover:bg-white/10 p-1"
                    >
                      {edu.degree}
                    </span>
                    {' • '}
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'years')}
                      className="outline-none hover:bg-white/10 p-1"
                    >
                      {edu.years}
                    </span>
                  </p>
                  {(edu.percentage || edu.cgpa) && (
                    <p className="text-[11px] text-zinc-600 mb-1">
                      {edu.cgpa && (
                        <>
                          CGPA:
                          <span
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'cgpa')}
                            className="outline-none hover:bg-white/10 p-1"
                          >
                            {edu.cgpa}
                          </span>
                        </>
                      )}
                      {edu.cgpa && edu.percentage && '  •  '}
                      {edu.percentage && (
                        <>
                          Percentage:
                          <span
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'percentage')}
                            className="outline-none hover:bg-white/10 p-1"
                          >
                            {edu.percentage}
                          </span>
                        </>
                      )}
                    </p>
                  )}
                  {edu.details && (
                    <p
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'details')}
                      className="text-xs leading-relaxed text-zinc-600 outline-none hover:bg-white/10 p-1"
                    >
                      {edu.details}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects (personal builds) */}
        {formData.projects?.length > 0 && (
          <section className="mb-6 mt-4" style={{ pageBreakInside: 'avoid' }}>
            <h2 className="bg-black text-white px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.35em] mb-5 shadow-sm">
              Projects
            </h2>
            <div className="pl-2 space-y-4 mt-2">
              {formData.projects.map((proj) => (
                <div key={proj.id} className="px-1" style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('project', e.currentTarget.textContent, proj.id, 'title')}
                      className="font-bold text-zinc-800 text-sm outline-none hover:bg-white/10 p-1"
                    >
                      {proj.title}
                    </h4>
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('project', e.currentTarget.textContent, proj.id, 'years')}
                      className="text-[10px] font-bold text-zinc-400 uppercase outline-none hover:bg-white/10 p-1"
                    >
                      {proj.years}
                    </span>
                  </div>
                  {proj.tech && (
                    <p
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('project', e.currentTarget.textContent, proj.id, 'tech')}
                      className="text-[10px] text-indigo-600 font-mono italic mb-1 outline-none hover:bg-white/10 p-1"
                    >
                      {proj.tech}
                    </p>
                  )}
                  {proj.description && (
                    <p
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('project', e.currentTarget.textContent, proj.id, 'description')}
                      className="text-[11px] leading-relaxed text-zinc-600 outline-none hover:bg-white/10 p-1"
                    >
                      {proj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {formData.certifications?.length > 0 && (
          <section className="mb-6 mt-4" style={{ pageBreakInside: 'avoid' }}>
            <h2 className="bg-black text-white px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.35em] mb-6 shadow-sm">
              Certifications
            </h2>
            <div className="pl-2 space-y-4 mt-2">
              {formData.certifications.map((cert) => (
                <div key={cert.id} style={{ pageBreakInside: 'avoid' }}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('certification', e.currentTarget.textContent, cert.id, 'title')}
                      className="font-bold text-zinc-800 text-sm outline-none hover:bg-white/10 p-1"
                    >
                      {cert.title}
                    </h4>
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('certification', e.currentTarget.textContent, cert.id, 'year')}
                      className="text-[10px] font-bold text-zinc-400 uppercase outline-none hover:bg-white/10 p-1"
                    >
                      {cert.year}
                    </span>
                  </div>
                  {cert.org && (
                    <p
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('certification', e.currentTarget.textContent, cert.id, 'org')}
                      className="text-xs text-zinc-500 italic outline-none hover:bg-white/10 p-1"
                    >
                      {cert.org}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Technical Skills (categorized) */}
        {formData.techSkills && (
          <section className="mt-4" style={{ pageBreakInside: 'avoid' }}>
            <h2 className="bg-black text-white px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.35em] mb-6 shadow-sm">
              Technical Skills
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
              {formData.techSkills.languages?.length > 0 && (
                <div>
                  <h3 className="font-bold text-zinc-800 mb-1 uppercase tracking-tight">
                    Programming Languages
                  </h3>
                  <ul className="space-y-0.5 text-zinc-600">
                    {formData.techSkills.languages.map((lang) => (
                      <li key={lang}>• {lang}</li>
                    ))}
                  </ul>
                </div>
              )}
              {formData.techSkills.frameworks?.length > 0 && (
                <div>
                  <h3 className="font-bold text-zinc-800 mb-1 uppercase tracking-tight">
                    Frameworks
                  </h3>
                  <ul className="space-y-0.5 text-zinc-600">
                    {formData.techSkills.frameworks.map((fw) => (
                      <li key={fw}>• {fw}</li>
                    ))}
                  </ul>
                </div>
              )}
              {formData.techSkills.tools?.length > 0 && (
                <div>
                  <h3 className="font-bold text-zinc-800 mb-1 uppercase tracking-tight">
                    Tools
                  </h3>
                  <ul className="space-y-0.5 text-zinc-600">
                    {formData.techSkills.tools.map((tool) => (
                      <li key={tool}>• {tool}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  const ModernTemplate = ({ formData, accentColor, leftPanelColor, rightPanelColor, selectedFont, isDarkMode }) => {
    return (
      <div className="w-full h-full flex font-sans" style={{ backgroundColor: rightPanelColor, fontFamily: selectedFont }}>
        {/* SIDEBAR */}
        <div className="w-[35%] p-6 space-y-8" style={{ backgroundColor: leftPanelColor }}>
          {/* Photo */}
          <div className="flex justify-center mb-2">
            <div className="w-40 h-40 rounded-full mx-auto border-4 border-white shadow-xl bg-zinc-300 flex items-center justify-center text-zinc-500 overflow-hidden">
              {formData.photo ? (
                <img src={formData.photo} alt="Profile" className="w-full h-full object-cover object-center" />
              ) : (
                <span className="text-xs uppercase font-bold">Photo</span>
              )}
            </div>
          </div>

          {/* About */}
          <div className="mb-2">
            <h3 className="text-sm font-bold border-b-2 border-black mb-4 pb-1.5 uppercase tracking-wider text-black">
              About Me
            </h3>
            <p
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleBlur('about', e.currentTarget.textContent)}
              className="text-[11px] leading-relaxed text-zinc-600 text-justify mt-2 outline-none hover:bg-white/10 p-1"
            >
              {formData.about}
            </p>
          </div>

          {/* Contact */}
          <div className="mb-2">
            <h3 className="text-sm font-bold border-b-2 border-black mb-4 pb-1.5 uppercase tracking-wider text-black">
              Contact
            </h3>
            <div className="space-y-3 mt-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full text-white shadow-sm" style={{ backgroundColor: accentColor }}>
                  <Phone size={12} />
                </div>
                <span className="text-xs font-medium text-zinc-700">{formData.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full text-white shadow-sm" style={{ backgroundColor: accentColor }}>
                  <Mail size={12} />
                </div>
                <span className="text-xs font-medium text-zinc-700">{formData.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full text-white shadow-sm" style={{ backgroundColor: accentColor }}>
                  <MapPin size={12} />
                </div>
                <span className="text-xs font-medium text-zinc-700">{formData.location}</span>
              </div>
            </div>
          </div>

          {/* Professional Links (left panel) */}
          {(formData.links?.github || formData.links?.linkedin || formData.links?.portfolio) && (
            <div className="mb-2">
              <h3 className="text-sm font-bold border-b-2 border-black mb-4 pb-1.5 uppercase tracking-wider text-black">
                Professional Links
              </h3>
              <div className="space-y-2 text-[10px] text-zinc-700 mt-2">
                {formData.links?.portfolio && (
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-full text-white shadow-sm" style={{ backgroundColor: accentColor }}>
                      <Globe size={12} />
                    </div>
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('links', e.currentTarget.textContent, null, 'portfolio')}
                      className="break-all outline-none hover:bg-white/10 p-1"
                    >
                      {formData.links.portfolio}
                    </span>
                  </div>
                )}
                {formData.links?.github && (
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-full text-white shadow-sm" style={{ backgroundColor: accentColor }}>
                      <Github size={12} />
                    </div>
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('links', e.currentTarget.textContent, null, 'github')}
                      className="break-all outline-none hover:bg-white/10 p-1"
                    >
                      {formData.links.github}
                    </span>
                  </div>
                )}
                {formData.links?.linkedin && (
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-full text-white shadow-sm" style={{ backgroundColor: accentColor }}>
                      <Linkedin size={12} />
                    </div>
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('links', e.currentTarget.textContent, null, 'linkedin')}
                      className="break-all outline-none hover:bg-white/10 p-1"
                    >
                      {formData.links.linkedin}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Languages */}
          {formData.languages.length > 0 && (
            <div className="mb-2">
              <h3 className="text-sm font-bold border-b-2 border-black mb-4 pb-1.5 uppercase tracking-wider text-black">
                Languages
              </h3>
              <div className="space-y-1.5 text-[10px] text-zinc-700 mt-2">
                {formData.languages.map((lang, index) => (
                  <div key={lang} className="flex items-center gap-2">
                    <span>•</span>
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('languages', e.currentTarget.textContent, index)}
                      className="outline-none hover:bg-white/10 p-1"
                    >
                      {lang}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expertise */}
          {formData.expertise.length > 0 && (
            <div className="mb-2">
              <h3 className="text-sm font-bold border-b-2 border-black mb-4 pb-1.5 uppercase tracking-wider text-black">
                Expertise
              </h3>
              <div className="space-y-1.5 text-[10px] text-zinc-700 mt-2">
                {formData.expertise.map((exp, index) => (
                  <div key={exp} className="flex items-center gap-2">
                    <span>•</span>
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('expertise', e.currentTarget.textContent, index)}
                      className="outline-none hover:bg-white/10 p-1"
                    >
                      {exp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div
          id="right-panel"
          className="w-[65%] p-6 overflow-y-auto"
          style={{ backgroundColor: rightPanelColor }}
        >
          {/* Header */}
          <header className="mb-10" style={{ pageBreakInside: 'avoid' }}>
            <h1
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleBlur('name', e.currentTarget.textContent)}
              className="text-5xl font-black tracking-tight text-black leading-none outline-none hover:bg-white/10 p-1"
            >
              {formData.name}
            </h1>
            <p
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleBlur('title', e.currentTarget.textContent)}
              className="text-sm font-semibold tracking-[0.35em] uppercase mt-3 text-zinc-700 outline-none hover:bg-white/10 p-1"
            >
              {formData.title}
            </p>
          </header>

          {/* Experience (internships / roles) */}
          {formData.experience.length > 0 && (
            <section className="mb-6 mt-2" style={{ pageBreakInside: 'avoid' }}>
              <h2 className="bg-black text-white px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.35em] mb-5 shadow-sm">
                Experience
              </h2>
              <div className="pl-2 space-y-4 mt-2">
                {formData.experience.map((exp) => (
                  <div key={exp.id} className="px-1" style={{ pageBreakInside: 'avoid' }}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('experience', e.currentTarget.textContent, exp.id, 'position')}
                        className="font-bold text-zinc-800 text-sm outline-none hover:bg-white/10 p-1"
                      >
                        {exp.position}
                      </h4>
                      <span
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('experience', e.currentTarget.textContent, exp.id, 'years')}
                        className="text-[10px] font-bold text-zinc-400 uppercase outline-none hover:bg-white/10 p-1"
                      >
                        {exp.years}
                      </span>
                    </div>
                    <p
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('experience', e.currentTarget.textContent, exp.id, 'company')}
                      className="text-[11px] text-zinc-500 font-semibold outline-none hover:bg-white/10 p-1"
                    >
                      {exp.company}
                    </p>
                    {exp.description && (
                      <p
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('experience', e.currentTarget.textContent, exp.id, 'description')}
                        className="text-[11px] leading-relaxed text-zinc-600 mt-1 outline-none hover:bg-white/10 p-1"
                      >
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {formData.education.length > 0 && (
            <section className="mb-8 mt-4" style={{ pageBreakInside: 'avoid' }}>
              <h2 className="bg-black text-white px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.35em] mb-6 shadow-sm">
                Education
              </h2>
              <div className="pl-2 space-y-5 mt-2">
                {formData.education.map((edu) => (
                  <div key={edu.id} style={{ pageBreakInside: 'avoid' }}>
                    <h4
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'institution')}
                      className="font-bold text-zinc-800 text-base outline-none hover:bg-white/10 p-1"
                    >
                      {edu.institution}
                    </h4>
                    <p className="text-xs text-zinc-500 italic mb-1">
                      <span
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'degree')}
                        className="outline-none hover:bg-white/10 p-1"
                      >
                        {edu.degree}
                      </span>
                      {' • '}
                      <span
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'years')}
                        className="outline-none hover:bg-white/10 p-1"
                      >
                        {edu.years}
                      </span>
                    </p>
                    {(edu.percentage || edu.cgpa) && (
                      <p className="text-[11px] text-zinc-600 mb-1">
                        {edu.cgpa && (
                          <>
                            CGPA:
                            <span
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'cgpa')}
                              className="outline-none hover:bg-white/10 p-1"
                            >
                              {edu.cgpa}
                            </span>
                          </>
                        )}
                        {edu.cgpa && edu.percentage && '  •  '}
                        {edu.percentage && (
                          <>
                            Percentage:
                            <span
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'percentage')}
                              className="outline-none hover:bg-white/10 p-1"
                            >
                              {edu.percentage}
                            </span>
                          </>
                        )}
                      </p>
                    )}
                    {edu.details && (
                      <p
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'details')}
                        className="text-xs leading-relaxed text-zinc-600 outline-none hover:bg-white/10 p-1"
                      >
                        {edu.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects (personal builds) */}
          {formData.projects?.length > 0 && (
            <section className="mb-6 mt-4" style={{ pageBreakInside: 'avoid' }}>
              <h2 className="bg-black text-white px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.35em] mb-5 shadow-sm">
                Projects
              </h2>
              <div className="pl-2 space-y-4 mt-2">
                {formData.projects.map((proj) => (
                  <div key={proj.id} className="px-1" style={{ pageBreakInside: 'avoid' }}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('project', e.currentTarget.textContent, proj.id, 'title')}
                        className="font-bold text-zinc-800 text-sm outline-none hover:bg-white/10 p-1"
                      >
                        {proj.title}
                      </h4>
                      <span
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('project', e.currentTarget.textContent, proj.id, 'years')}
                        className="text-[10px] font-bold text-zinc-400 uppercase outline-none hover:bg-white/10 p-1"
                      >
                        {proj.years}
                      </span>
                    </div>
                    {proj.tech && (
                      <p
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('project', e.currentTarget.textContent, proj.id, 'tech')}
                        className="text-[10px] text-indigo-600 font-mono italic mb-1 outline-none hover:bg-white/10 p-1"
                      >
                        {proj.tech}
                      </p>
                    )}
                    {proj.description && (
                      <p
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('project', e.currentTarget.textContent, proj.id, 'description')}
                        className="text-[11px] leading-relaxed text-zinc-600 outline-none hover:bg-white/10 p-1"
                      >
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          {/* Certifications */}
          {formData.certifications?.length > 0 && (
            <section className="mb-6 mt-4" style={{ pageBreakInside: 'avoid' }}>
              <h2 className="bg-black text-white px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.35em] mb-6 shadow-sm">
                Certifications
              </h2>
              <div className="pl-2 space-y-4 mt-2">
                {formData.certifications.map((cert) => (
                  <div key={cert.id} style={{ pageBreakInside: 'avoid' }}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('certification', e.currentTarget.textContent, cert.id, 'title')}
                        className="font-bold text-zinc-800 text-sm outline-none hover:bg-white/10 p-1"
                      >
                        {cert.title}
                      </h4>
                      <span
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('certification', e.currentTarget.textContent, cert.id, 'year')}
                        className="text-[10px] font-bold text-zinc-400 uppercase outline-none hover:bg-white/10 p-1"
                      >
                        {cert.year}
                      </span>
                    </div>
                    {cert.org && (
                      <p
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('certification', e.currentTarget.textContent, cert.id, 'org')}
                        className="text-xs text-zinc-500 italic outline-none hover:bg-white/10 p-1"
                      >
                        {cert.org}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Technical Skills (categorized) */}
          {formData.techSkills && (
            <section className="mt-4" style={{ pageBreakInside: 'avoid' }}>
              <h2 className="bg-black text-white px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.35em] mb-6 shadow-sm">
                Technical Skills
              </h2>
              <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
                {formData.techSkills.languages?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-zinc-800 mb-1 uppercase tracking-tight">
                      Programming Languages
                    </h3>
                    <ul className="space-y-0.5 text-zinc-600">
                      {formData.techSkills.languages.map((lang, index) => (
                        <li key={lang}>
                          •
                          <span
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => handleBlur('techSkills', e.currentTarget.textContent, index, 'languages')}
                            className="outline-none hover:bg-white/10 p-1"
                          >
                            {lang}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {formData.techSkills.frameworks?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-zinc-800 mb-1 uppercase tracking-tight">
                      Frameworks
                    </h3>
                    <ul className="space-y-0.5 text-zinc-600">
                      {formData.techSkills.frameworks.map((fw, index) => (
                        <li key={fw}>
                          •
                          <span
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => handleBlur('techSkills', e.currentTarget.textContent, index, 'frameworks')}
                            className="outline-none hover:bg-white/10 p-1"
                          >
                            {fw}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {formData.techSkills.tools?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-zinc-800 mb-1 uppercase tracking-tight">
                      Tools
                    </h3>
                    <ul className="space-y-0.5 text-zinc-600">
                      {formData.techSkills.tools.map((tool, index) => (
                        <li key={tool}>
                          •
                          <span
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => handleBlur('techSkills', e.currentTarget.textContent, index, 'tools')}
                            className="outline-none hover:bg-white/10 p-1"
                          >
                            {tool}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

        </div>
      </div>
    );
  };

  const MinimalistAccountantTemplate = ({ formData, accentColor, selectedFont }) => (
    <div className="w-full h-full bg-[#fcfcfc] p-8 font-sans text-[#303030]" style={{ fontFamily: selectedFont }}>
      {/* HEADER SECTION */}
      <header className="text-center mb-8">
        <h1
          contentEditable={true}
          suppressContentEditableWarning={true}
          onBlur={(e) => handleBlur('name', e.currentTarget.textContent)}
          className="text-5xl font-black uppercase tracking-tighter mb-4 leading-none outline-none hover:bg-white/10 p-1"
        >
          {formData.name}
        </h1>
        <div className="h-1 w-20 bg-[#303030] mx-auto mb-4" />
        <p
          contentEditable={true}
          suppressContentEditableWarning={true}
          onBlur={(e) => handleBlur('title', e.currentTarget.textContent)}
          className="text-sm font-bold tracking-[0.2em] text-[#747474] uppercase outline-none hover:bg-white/10 p-1"
        >
          {formData.title}
        </p>
      </header>

      <div className="flex flex-col gap-3">
        {/* PERSONAL INFO */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-[0.3em] border-b-2 border-[#303030] pb-2 mb-2">
            Personal Info
          </h2>
          <p
            contentEditable={true}
            suppressContentEditableWarning={true}
            onBlur={(e) => handleBlur('about', e.currentTarget.textContent)}
            className="text-[11px] leading-relaxed text-[#303030] max-w-2xl outline-none hover:bg-white/10 p-1"
          >
            {formData.about}
          </p>
        </section>

        {/* CONTACT */}
        <section>
          <h2
            className="text-xs font-black uppercase tracking-[0.3em] border-b-2 pb-2 mb-4"
            style={{ borderColor: accentColor }}
          >
            Contact
          </h2>
          <div className="space-y-2">
            <p className="text-[11px] text-[#303030]">
              <strong>Phone:</strong>
              <span
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleBlur('phone', e.currentTarget.textContent)}
                className="outline-none hover:bg-white/10 p-1"
              >
                {formData.phone}
              </span>
            </p>
            <p className="text-[11px] text-[#303030]">
              <strong>Email:</strong>
              <span
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleBlur('email', e.currentTarget.textContent)}
                className="outline-none hover:bg-white/10 p-1"
              >
                {formData.email}
              </span>
            </p>
            <p className="text-[11px] text-[#303030]">
              <strong>Location:</strong>
              <span
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleBlur('location', e.currentTarget.textContent)}
                className="outline-none hover:bg-white/10 p-1"
              >
                {formData.location}
              </span>
            </p>
            {formData.links.portfolio && (
              <p className="text-[11px] text-[#303030]">
                <strong>Portfolio:</strong>
                <span
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleBlur('links', e.currentTarget.textContent, null, 'portfolio')}
                  className="outline-none hover:bg-white/10 p-1"
                >
                  {formData.links.portfolio}
                </span>
              </p>
            )}
            {formData.links.github && (
              <p className="text-[11px] text-[#303030]">
                <strong>GitHub:</strong>
                <span
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleBlur('links', e.currentTarget.textContent, null, 'github')}
                  className="outline-none hover:bg-white/10 p-1"
                >
                  {formData.links.github}
                </span>
              </p>
            )}
            {formData.links.linkedin && (
              <p className="text-[11px] text-[#303030]">
                <strong>LinkedIn:</strong>
                <span
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleBlur('links', e.currentTarget.textContent, null, 'linkedin')}
                  className="outline-none hover:bg-white/10 p-1"
                >
                  {formData.links.linkedin}
                </span>
              </p>
            )}
          </div>
        </section>

        {/* EXPERIENCE */}
        <section>
          <h2
            className="text-xs font-black uppercase tracking-[0.3em] border-b-2 pb-2 mb-2"
            style={{ borderColor: accentColor }}
          >
            Professional Experience
          </h2>
          <div className="space-y-8">
            {formData.experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h4
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('experience', e.currentTarget.textContent, exp.id, 'position')}
                    className="text-sm font-black uppercase outline-none hover:bg-white/10 p-1"
                  >
                    {exp.position}
                  </h4>
                  <span
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('experience', e.currentTarget.textContent, exp.id, 'years')}
                    className="text-[10px] font-bold text-[#aaaaaa] outline-none hover:bg-white/10 p-1"
                  >
                    {exp.years}
                  </span>
                </div>
                <p
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleBlur('experience', e.currentTarget.textContent, exp.id, 'company')}
                  className="text-[11px] font-bold text-[#747474] mb-2 uppercase tracking-wide outline-none hover:bg-white/10 p-1"
                >
                  {exp.company}
                </p>
                <p
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleBlur('experience', e.currentTarget.textContent, exp.id, 'description')}
                  className="text-[11px] leading-relaxed text-[#303030] max-w-2xl outline-none hover:bg-white/10 p-1"
                >
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* PROJECTS */}
        {formData.projects?.length > 0 && (
          <section>
            <h2
              className="text-xs font-black uppercase tracking-[0.3em] border-b-2 pb-2 mb-4"
              style={{ borderColor: accentColor }}
            >
              Projects
            </h2>
            <div className="space-y-6">
              {formData.projects.map(proj => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-sm font-black uppercase">{proj.title}</h4>
                    <span className="text-[10px] font-bold text-[#aaaaaa]">{proj.years}</span>
                  </div>
                  <p className="text-[11px] font-bold text-[#747474] mb-2 uppercase tracking-wide">
                    {proj.tech}
                  </p>
                  <p className="text-[11px] leading-relaxed text-[#303030] max-w-2xl">
                    {proj.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CERTIFICATIONS */}
        {formData.certifications?.length > 0 && (
          <section>
            <h2
              className="text-xs font-black uppercase tracking-[0.3em] border-b-2 pb-2 mb-2"
              style={{ borderColor: accentColor }}
            >
              Certifications
            </h2>
            <div className="space-y-4">
              {formData.certifications.map(cert => (
                <div key={cert.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('certification', e.currentTarget.textContent, cert.id, 'title')}
                      className="text-sm font-black uppercase outline-none hover:bg-white/10 p-1"
                    >
                      {cert.title}
                    </h4>
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('certification', e.currentTarget.textContent, cert.id, 'year')}
                      className="text-[10px] font-bold text-[#aaaaaa] outline-none hover:bg-white/10 p-1"
                    >
                      {cert.year}
                    </span>
                  </div>
                  <p
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('certification', e.currentTarget.textContent, cert.id, 'org')}
                    className="text-[11px] font-bold text-[#747474] uppercase tracking-wide outline-none hover:bg-white/10 p-1"
                  >
                    {cert.org}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EDUCATION */}
        <section>
          <h2
            className="text-xs font-black uppercase tracking-[0.3em] border-b-2 pb-2 mb-6"
            style={{ borderColor: accentColor }}
          >
            Education
          </h2>
          {formData.education.map(edu => (
            <div key={edu.id} className="mb-4">
              <p
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'institution')}
                className="text-[11px] font-black uppercase outline-none hover:bg-white/10 p-1"
              >
                {edu.institution}
              </p>
              <p
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'degree')}
                className="text-[10px] text-[#747474] font-bold outline-none hover:bg-white/10 p-1"
              >
                {edu.degree}
              </p>
              <p
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'years')}
                className="text-[10px] text-[#aaaaaa] outline-none hover:bg-white/10 p-1"
              >
                {edu.years}
              </p>
              {(edu.percentage || edu.cgpa) && (
                <p className="text-[10px] text-[#747474]">
                  {edu.cgpa && (
                    <>
                      CGPA:
                      <span
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'cgpa')}
                        className="outline-none hover:bg-white/10 p-1"
                      >
                        {edu.cgpa}
                      </span>
                    </>
                  )}
                  {edu.cgpa && edu.percentage && ' • '}
                  {edu.percentage && (
                    <>
                      Percentage:
                      <span
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'percentage')}
                        className="outline-none hover:bg-white/10 p-1"
                      >
                        {edu.percentage}
                      </span>
                    </>
                  )}
                </p>
              )}
            </div>
          ))}
        </section>

        {/* TECHNICAL SKILLS */}
        {formData.techSkills && (
          <section>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] border-b-2 border-[#303030] pb-2 mb-2">
              Technical Skills
            </h2>
            <div className="grid grid-cols-3 gap-6">
              {formData.techSkills.languages?.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black uppercase mb-2">Languages</h3>
                  <ul className="space-y-1">
                    {formData.techSkills.languages.map((lang) => (
                      <li key={lang} className="text-[10px] text-[#303030]">• {lang}</li>
                    ))}
                  </ul>
                </div>
              )}
              {formData.techSkills.frameworks?.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black uppercase mb-2">Frameworks</h3>
                  <ul className="space-y-1">
                    {formData.techSkills.frameworks.map((fw) => (
                      <li key={fw} className="text-[10px] text-[#303030]">• {fw}</li>
                    ))}
                  </ul>
                </div>
              )}
              {formData.techSkills.tools?.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black uppercase mb-2">Tools</h3>
                  <ul className="space-y-1">
                    {formData.techSkills.tools.map((tool) => (
                      <li key={tool} className="text-[10px] text-[#303030]">• {tool}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  const BlueGeometricTemplate = ({ formData, accentColor, selectedFont }) => {
    // Generate a very soft version for geometric backgrounds
    const softAccent = getLightColor(accentColor, 0.1);
    const mediumAccent = getLightColor(accentColor, 0.4);

    return (
      <div className="w-full h-full flex bg-white font-sans overflow-hidden relative" style={{ fontFamily: selectedFont }}>
        {/* ADAPTIVE SIDEBAR */}
        <div
          className="w-[33%] p-6 space-y-6 text-white relative z-10 transition-colors duration-500"
          style={{ backgroundColor: accentColor }}
        >
          <div className="w-36 h-36 rounded-lg border-4 overflow-hidden shadow-2xl" style={{ borderColor: mediumAccent }}>
            {formData.photo && <img src={formData.photo} alt="Profile" className="w-full h-full object-cover object-center" />}
          </div>
          <div className="mt-12">
            <h2 className="text-3xl font-black text-white leading-tight">{formData.name}</h2>
            <p className="font-bold uppercase tracking-widest text-xs" style={{ color: mediumAccent }}>{formData.title}</p>
          </div>
          <section>
            <h3 className="text-sm font-bold border-b pb-2 mb-4 uppercase" style={{ borderColor: mediumAccent }}>Profile</h3>
            <p className="text-[10px] text-white leading-relaxed opacity-90">{formData.about}</p>
          </section>
          <section>
            <h3 className="text-sm font-bold border-b pb-2 mb-4 uppercase" style={{ borderColor: mediumAccent }}>Contact</h3>
            <div className="text-[10px] space-y-3">
              <p>📞 {formData.phone}</p>
              <p>📧 {formData.email}</p>
              <p>📍 {formData.location}</p>
            </div>
          </section>
          {/* Links */}
          {(formData.links?.github || formData.links?.linkedin || formData.links?.portfolio) && (
            <section>
              <h3 className="text-sm font-bold border-b pb-2 mb-4 uppercase" style={{ borderColor: mediumAccent }}>Links</h3>
              <div className="space-y-2 text-[10px]">
                {formData.links?.portfolio && (
                  <p>🌐 {formData.links.portfolio}</p>
                )}
                {formData.links?.github && (
                  <p>🐙 {formData.links.github}</p>
                )}
                {formData.links?.linkedin && (
                  <p>💼 {formData.links.linkedin}</p>
                )}
              </div>
            </section>
          )}
          {/* Languages */}
          {formData.languages.length > 0 && (
            <section>
              <h3 className="text-sm font-bold border-b pb-2 mb-4 uppercase" style={{ borderColor: mediumAccent }}>Languages</h3>
              <div className="space-y-1 text-[10px]">
                {formData.languages.map(lang => (
                  <div key={lang}>{lang}: Fluent</div>
                ))}
              </div>
            </section>
          )}
          {/* Expertise */}
          {formData.expertise.length > 0 && (
            <section>
              <h3 className="text-sm font-bold border-b pb-2 mb-4 uppercase" style={{ borderColor: mediumAccent }}>Expertise</h3>
              <div className="space-y-1 text-[10px]">
                {formData.expertise.map(exp => (
                  <div key={exp}>• {exp}</div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* MAIN CONTENT WITH COLOR-MATCHED GEOMETRY */}
        <div className="flex-1 p-8 relative">
          <div
            className="absolute top-0 right-0 w-48 h-48 -mr-16 -mt-16 rotate-45 transition-colors"
            style={{ backgroundColor: softAccent }}
          />
          <header className="mb-12">
            <h1
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleBlur('name', e.currentTarget.textContent)}
              className="text-4xl font-black text-slate-900 outline-none hover:bg-white/10 p-1"
            >
              {formData.name}
            </h1>
            <p
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleBlur('title', e.currentTarget.textContent)}
              className="font-bold tracking-widest uppercase text-xs mt-2 outline-none hover:bg-white/10 p-1"
              style={{ color: accentColor }}
            >
              {formData.title}
            </p>
          </header>
          {/* Education */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Education</h2>
            <div className="space-y-4">
              {formData.education.map(edu => (
                <div key={edu.id} className="text-sm">
                  <p
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'institution')}
                    className="font-bold text-slate-900 outline-none hover:bg-white/10 p-1"
                  >
                    {edu.institution}
                  </p>
                  <p className="text-slate-600 italic">
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'degree')}
                      className="outline-none hover:bg-white/10 p-1"
                    >
                      {edu.degree}
                    </span>
                    {' • '}
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'years')}
                      className="outline-none hover:bg-white/10 p-1"
                    >
                      {edu.years}
                    </span>
                  </p>
                  {(edu.percentage || edu.cgpa) && (
                    <p className="text-slate-600">
                      {edu.cgpa && (
                        <>
                          CGPA:
                          <span
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'cgpa')}
                            className="outline-none hover:bg-white/10 p-1"
                          >
                            {edu.cgpa}
                          </span>
                        </>
                      )}
                      {edu.cgpa && edu.percentage && ' • '}
                      {edu.percentage && (
                        <>
                          Percentage:
                          <span
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'percentage')}
                            className="outline-none hover:bg-white/10 p-1"
                          >
                            {edu.percentage}
                          </span>
                        </>
                      )}
                    </p>
                  )}
                  {edu.details && (
                    <p
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'details')}
                      className="text-slate-600 outline-none hover:bg-white/10 p-1"
                    >
                      {edu.details}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
          {/* Experience */}
          {formData.experience.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Experience</h2>
              <div className="space-y-4">
                {formData.experience.map(exp => (
                  <div key={exp.id} className="text-sm">
                    <p
                      className="font-bold text-slate-900 outline-none hover:bg-white/10 p-1"
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('experience', e.currentTarget.textContent, exp.id, 'position')}
                    >
                      {exp.position}
                    </p>
                    <p className="text-slate-600 italic">
                      <span
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('experience', e.currentTarget.textContent, exp.id, 'company')}
                        className="outline-none hover:bg-white/10 p-1"
                      >
                        {exp.company}
                      </span> • <span
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('experience', e.currentTarget.textContent, exp.id, 'years')}
                        className="outline-none hover:bg-white/10 p-1"
                      >
                        {exp.years}
                      </span>
                    </p>
                    {exp.description && (
                      <p
                        className="text-slate-600 outline-none hover:bg-white/10 p-1"
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('experience', e.currentTarget.textContent, exp.id, 'description')}
                      >
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          {/* Projects */}
          {formData.projects?.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Projects</h2>
              <div className="space-y-4">
                {formData.projects.map(proj => (
                  <div key={proj.id} className="text-sm">
                    <p
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('project', e.currentTarget.textContent, proj.id, 'title')}
                      className="font-bold text-slate-900 outline-none hover:bg-white/10 p-1"
                    >
                      {proj.title}
                    </p>
                    <p className="text-slate-600 italic">
                      <span
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('project', e.currentTarget.textContent, proj.id, 'tech')}
                        className="outline-none hover:bg-white/10 p-1"
                      >
                        {proj.tech}
                      </span>
                      {' • '}
                      <span
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('project', e.currentTarget.textContent, proj.id, 'years')}
                        className="outline-none hover:bg-white/10 p-1"
                      >
                        {proj.years}
                      </span>
                    </p>
                    {proj.description && (
                      <p
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('project', e.currentTarget.textContent, proj.id, 'description')}
                        className="text-slate-600 outline-none hover:bg-white/10 p-1"
                      >
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          {/* Certifications */}
          {formData.certifications?.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Certifications</h2>
              <div className="space-y-4">
                {formData.certifications.map(cert => (
                  <div key={cert.id} className="text-sm">
                    <p
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('certification', e.currentTarget.textContent, cert.id, 'title')}
                      className="font-bold text-slate-900 outline-none hover:bg-white/10 p-1"
                    >
                      {cert.title}
                    </p>
                    <p className="text-slate-600 italic">
                      <span
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('certification', e.currentTarget.textContent, cert.id, 'org')}
                        className="outline-none hover:bg-white/10 p-1"
                      >
                        {cert.org}
                      </span>
                      {' • '}
                      <span
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('certification', e.currentTarget.textContent, cert.id, 'year')}
                        className="outline-none hover:bg-white/10 p-1"
                      >
                        {cert.year}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
          {/* Technical Skills */}
          {formData.techSkills && (
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Technical Skills</h2>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {formData.techSkills.languages?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1 uppercase tracking-tight">
                      Programming Languages
                    </h3>
                    <ul className="space-y-0.5 text-slate-600">
                      {formData.techSkills.languages.map((lang, index) => (
                        <li key={lang}>
                          •
                          <span
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => handleBlur('techSkills', e.currentTarget.textContent, index, 'languages')}
                            className="outline-none hover:bg-white/10 p-1"
                          >
                            {lang}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {formData.techSkills.frameworks?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1 uppercase tracking-tight">
                      Frameworks
                    </h3>
                    <ul className="space-y-0.5 text-slate-600">
                      {formData.techSkills.frameworks.map((fw, index) => (
                        <li key={fw}>
                          •
                          <span
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => handleBlur('techSkills', e.currentTarget.textContent, index, 'frameworks')}
                            className="outline-none hover:bg-white/10 p-1"
                          >
                            {fw}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {formData.techSkills.tools?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1 uppercase tracking-tight">
                      Tools
                    </h3>
                    <ul className="space-y-0.5 text-slate-600">
                      {formData.techSkills.tools.map((tool, index) => (
                        <li key={tool}>
                          •
                          <span
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => handleBlur('techSkills', e.currentTarget.textContent, index, 'tools')}
                            className="outline-none hover:bg-white/10 p-1"
                          >
                            {tool}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  };

  const PlayfulRetroTemplate = ({ formData, accentColor, selectedFont }) => {
    const lightBg = getLightColor(accentColor, 0.3);

    return (
      <div className="w-full h-full bg-[#FFFBF2] p-6 font-sans text-[#4A4A4A] relative overflow-hidden" style={{ fontFamily: selectedFont }}>
        {/* DYNAMIC BACKGROUND SHAPES */}
        <div
          className="absolute top-[-20px] left-[-20px] w-32 h-32 rounded-full z-0"
          style={{ backgroundColor: lightBg }}
        />
        <div
          className="absolute top-10 right-10 w-20 h-20 rounded-2xl rotate-12 z-0"
          style={{ backgroundColor: lightBg, opacity: 0.5 }}
        />
        <div
          className="absolute bottom-[-30px] right-[-30px] w-48 h-48 rounded-full z-0"
          style={{ backgroundColor: lightBg }}
        />

        {/* HEADER SECTION */}
        <div className="relative z-10 flex gap-10 mb-12">
          <div
            className="w-44 h-44 bg-white p-2 rounded-[40px] shadow-sm border-4"
            style={{ borderColor: accentColor }}
          >
            <div className="w-full h-full rounded-[32px] overflow-hidden bg-zinc-200">
              {formData.photo ? (
                <img src={formData.photo} alt="Profile" className="w-full h-full object-cover object-center" />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-400">Photo</div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-black uppercase tracking-tight text-[#333]">
              {formData.name || "RACHELLE BEAUDRY"}
            </h1>
            <p className="text-xl font-bold mt-1 italic" style={{ color: accentColor }}>
              {formData.title || "Web Designer"}
            </p>
            <div className="w-16 h-1 mt-4" style={{ backgroundColor: accentColor }} />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8 relative z-10">
          {/* LEFT COLUMN */}
          <div className="col-span-5 space-y-6">
            <section>
              <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: accentColor }}>Experience</h2>
              {formData.experience.map(exp => (
                <div key={exp.id} className="mb-6 relative pl-4" style={{ borderLeftColor: accentColor, borderLeftWidth: '2px' }}>
                  <p className="text-xs font-black uppercase">{exp.position}</p>
                  <p className="text-[10px] font-bold text-zinc-500">{exp.company} • {exp.years}</p>
                  <p className="text-[10px] leading-relaxed mt-1">{exp.description}</p>
                </div>
              ))}
            </section>

            <section>
              <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: accentColor }}>Education</h2>
              {formData.education.map(edu => (
                <div key={edu.id} className="mb-4 relative pl-4" style={{ borderLeftColor: accentColor, borderLeftWidth: '2px' }}>
                  <p
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'institution')}
                    className="text-xs font-black uppercase outline-none hover:bg-white/10 p-1"
                  >
                    {edu.institution}
                  </p>
                  <p className="text-[10px] font-bold text-zinc-500">
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'degree')}
                      className="outline-none hover:bg-white/10 p-1"
                    >
                      {edu.degree}
                    </span>
                    {' • '}
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'years')}
                      className="outline-none hover:bg-white/10 p-1"
                    >
                      {edu.years}
                    </span>
                  </p>
                  {(edu.percentage || edu.cgpa) && (
                    <p className="text-[10px] text-zinc-500">
                      {edu.cgpa && (
                        <>
                          CGPA:
                          <span
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'cgpa')}
                            className="outline-none hover:bg-white/10 p-1"
                          >
                            {edu.cgpa}
                          </span>
                        </>
                      )}
                      {edu.cgpa && edu.percentage && ' • '}
                      {edu.percentage && (
                        <>
                          Percentage:
                          <span
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'percentage')}
                            className="outline-none hover:bg-white/10 p-1"
                          >
                            {edu.percentage}
                          </span>
                        </>
                      )}
                    </p>
                  )}
                </div>
              ))}
            </section>

            {/* Projects */}
            {formData.projects?.length > 0 && (
              <section>
                <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: accentColor }}>Projects</h2>
                <div className="space-y-4">
                  {formData.projects.map(proj => (
                    <div key={proj.id} className="mb-4 relative pl-4" style={{ borderLeftColor: accentColor, borderLeftWidth: '2px' }}>
                      <p
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('project', e.currentTarget.textContent, proj.id, 'title')}
                        className="text-xs font-black uppercase outline-none hover:bg-white/10 p-1"
                      >
                        {proj.title}
                      </p>
                      <p className="text-[10px] font-bold text-zinc-500">
                        <span
                          contentEditable={true}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => handleBlur('project', e.currentTarget.textContent, proj.id, 'tech')}
                          className="outline-none hover:bg-white/10 p-1"
                        >
                          {proj.tech}
                        </span>
                        {' • '}
                        <span
                          contentEditable={true}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => handleBlur('project', e.currentTarget.textContent, proj.id, 'years')}
                          className="outline-none hover:bg-white/10 p-1"
                        >
                          {proj.years}
                        </span>
                      </p>
                      <p
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('project', e.currentTarget.textContent, proj.id, 'description')}
                        className="text-[10px] leading-relaxed mt-1 outline-none hover:bg-white/10 p-1"
                      >
                        {proj.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-span-7 space-y-6">
            <section>
              <h2 className="text-sm font-black uppercase tracking-widest mb-2" style={{ color: accentColor }}>About Me</h2>
              <p className="text-xs leading-relaxed text-justify">{formData.about}</p>
            </section>

            <section>
              <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: accentColor }}>Contact</h2>
              <div className="space-y-2 text-[10px] font-bold">
                <p className="flex items-center gap-2">
                  🧡
                  <span
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('email', e.currentTarget.textContent)}
                    className="outline-none hover:bg-white/10 p-1"
                  >
                    {formData.email}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  📞
                  <span
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('phone', e.currentTarget.textContent)}
                    className="outline-none hover:bg-white/10 p-1"
                  >
                    {formData.phone}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  📍
                  <span
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('location', e.currentTarget.textContent)}
                    className="outline-none hover:bg-white/10 p-1"
                  >
                    {formData.location}
                  </span>
                </p>
              </div>
            </section>

            {/* Professional Links */}
            {(formData.links?.portfolio || formData.links?.github || formData.links?.linkedin) && (
              <section>
                <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: accentColor }}>Professional Links</h2>
                <div className="space-y-2 text-[10px] font-bold">
                  {formData.links?.portfolio && <p className="flex items-center gap-2">🌐 {formData.links.portfolio}</p>}
                  {formData.links?.github && <p className="flex items-center gap-2">🐙 {formData.links.github}</p>}
                  {formData.links?.linkedin && <p className="flex items-center gap-2">💼 {formData.links.linkedin}</p>}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: accentColor }}>Skills</h2>
              <div className="space-y-3">
                {formData.techSkills.languages.slice(0, 4).map((skill, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-[10px] font-bold mb-1 uppercase">
                      <span
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('techSkills', e.currentTarget.textContent, idx, 'languages')}
                        className="outline-none hover:bg-white/10 p-1"
                      >
                        {skill}
                      </span>
                      <span>80%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ backgroundColor: accentColor, width: '80%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Certifications */}
            {formData.certifications?.length > 0 && (
              <section>
                <h2 className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: accentColor }}>Certifications</h2>
                <div className="space-y-2">
                  {formData.certifications.map(cert => (
                    <div key={cert.id} className="relative pl-4" style={{ borderLeftColor: accentColor, borderLeftWidth: '2px' }}>
                      <p
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('certification', e.currentTarget.textContent, cert.id, 'title')}
                        className="text-xs font-black uppercase outline-none hover:bg-white/10 p-1"
                      >
                        {cert.title}
                      </p>
                      <p className="text-[10px] font-bold text-zinc-500">
                        <span
                          contentEditable={true}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => handleBlur('certification', e.currentTarget.textContent, cert.id, 'org')}
                          className="outline-none hover:bg-white/10 p-1"
                        >
                          {cert.org}
                        </span>
                        {' • '}
                        <span
                          contentEditable={true}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => handleBlur('certification', e.currentTarget.textContent, cert.id, 'year')}
                          className="outline-none hover:bg-white/10 p-1"
                        >
                          {cert.year}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  };

  const NewPlayfulRetroTemplate = ({ formData, accentColor, selectedFont }) => {
    // Default colors from the image, but use accentColor for primary
    const theme = {
      bg: "#FFFBF2",      // Cream background
      primary: accentColor || "#E8A87C", // Use accentColor if provided
      secondary: "#C3E2D3", // Mint green accent
      text: "#4A4A4A",
      white: "#FFFFFF"
    };

    return (
      <div className="w-full h-full p-6 font-sans relative overflow-hidden" style={{ backgroundColor: theme.bg, color: theme.text, fontFamily: selectedFont }}>

        {/* BACKGROUND GEOMETRIC SHAPES */}
        {/* Top Left Circle */}
        <div
          className="absolute top-[-50px] left-[-50px] w-64 h-64 rounded-full opacity-80"
          style={{ backgroundColor: theme.primary }}
        />
        {/* Top Right Square (Rotated) */}
        <div
          className="absolute top-12 right-12 w-32 h-32 rounded-3xl opacity-40 rotate-12"
          style={{ backgroundColor: theme.primary }}
        />
        {/* Bottom Right Circle */}
        <div
          className="absolute bottom-[-60px] right-[-40px] w-80 h-80 rounded-full opacity-60"
          style={{ backgroundColor: theme.primary }}
        />
        {/* Left Middle Small Circle (Mint) */}
        <div
          className="absolute top-[45%] left-[-20px] w-24 h-24 rounded-full opacity-60"
          style={{ backgroundColor: theme.secondary }}
        />
        {/* Right Middle Small Square (Mint) */}
        <div
          className="absolute top-[30%] right-[-10px] w-16 h-16 rounded-2xl opacity-60 rotate-45"
          style={{ backgroundColor: "#F3E1C5" }} // Beige shape
        />

        {/* HEADER SECTION */}
        <div className="relative z-10 flex gap-12 mb-16 items-center">
          {/* Photo with rounded square frame */}
          <div className="relative">
            <div
              className="w-48 h-48 p-2 rounded-[40px] shadow-sm border-[6px]"
              style={{ backgroundColor: theme.white, borderColor: theme.primary }}
            >
              <div className="w-full h-full rounded-[32px] overflow-hidden bg-zinc-200">
                {formData.photo ? (
                  <img src={formData.photo} alt="Profile" className="w-full h-full object-cover object-center" />
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-400 font-bold">PHOTO</div>
                )}
              </div>
            </div>
          </div>

          {/* Name and Title */}
          <div className="flex flex-col">
            {/* Decorative Badges above name */}
            <div className="flex gap-3 mb-4">
              <span className="px-4 py-1 text-[10px] font-bold text-white rounded-full uppercase tracking-wider" style={{ backgroundColor: theme.primary }}>
                Resume
              </span>
              <span className="px-4 py-1 text-[10px] font-bold text-zinc-600 bg-[#EFE5D5] rounded-full uppercase tracking-wider">
                Portfolio
              </span>
            </div>

            <h1 className="text-5xl font-black uppercase tracking-tight leading-none text-[#2D2D2D]">
              {formData.name || "RACHELLE BEAUDRY"}
            </h1>
            <p className="text-xl font-bold mt-2 italic tracking-wide" style={{ color: theme.primary }}>
              {formData.title || "Web Designer"}
            </p>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-12 gap-8 relative z-10">

          {/* LEFT COLUMN (Experience & Education) */}
          <div className="col-span-5 space-y-8">
            {/* Experience */}
            <section>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-6" style={{ color: theme.primary }}>
                Experience
              </h2>
              <div className="space-y-8">
                {formData.experience.map(exp => (
                  <div key={exp.id} className="relative pl-5 border-l-2" style={{ borderColor: theme.primary }}>
                    {/* Dot on timeline */}
                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary }} />

                    <p className="text-xs font-black uppercase text-[#333]">{exp.position}</p>
                    <p className="text-[10px] font-bold text-zinc-500 mb-1">{exp.company} | {exp.years}</p>
                    <p className="text-[10px] leading-relaxed text-zinc-600">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Education */}
            <section>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-6" style={{ color: theme.primary }}>
                Education
              </h2>
              <div className="space-y-6">
                {formData.education.map(edu => (
                  <div key={edu.id} className="relative pl-5 border-l-2" style={{ borderColor: theme.primary }}>
                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary }} />
                    <p
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'institution')}
                      className="text-xs font-black uppercase text-[#333] outline-none hover:bg-white/10 p-1"
                    >
                      {edu.institution}
                    </p>
                    <p
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'degree')}
                      className="text-[10px] font-bold text-zinc-500 outline-none hover:bg-white/10 p-1"
                    >
                      {edu.degree}
                    </p>
                    <p
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'years')}
                      className="text-[10px] italic text-zinc-400 outline-none hover:bg-white/10 p-1"
                    >
                      {edu.years}
                    </p>
                    {(edu.percentage || edu.cgpa) && (
                      <p className="text-[10px] text-zinc-500">
                        {edu.cgpa && (
                          <>
                            CGPA:
                            <span
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'cgpa')}
                              className="outline-none hover:bg-white/10 p-1"
                            >
                              {edu.cgpa}
                            </span>
                          </>
                        )}
                        {edu.cgpa && edu.percentage && ' • '}
                        {edu.percentage && (
                          <>
                            Percentage:
                            <span
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'percentage')}
                              className="outline-none hover:bg-white/10 p-1"
                            >
                              {edu.percentage}
                            </span>
                          </>
                        )}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN (About, Skills, Contact) */}
          <div className="col-span-7 space-y-6 pl-4">

            {/* About Me */}
            <section>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-4" style={{ color: theme.primary }}>
                About Me
              </h2>
              <p
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleBlur('about', e.currentTarget.textContent)}
                className="text-[11px] leading-6 text-zinc-600 font-medium text-justify outline-none hover:bg-white/10 p-1"
              >
                {formData.about || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
              </p>
            </section>

            {/* Projects */}
            {formData.projects?.length > 0 && (
              <section>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-4" style={{ color: theme.primary }}>
                  Projects
                </h2>
                <div className="space-y-4">
                  {formData.projects.map(proj => (
                    <div key={proj.id} className="relative pl-4 border-l-2" style={{ borderColor: theme.primary }}>
                      <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary }} />
                      <p className="text-xs font-black uppercase text-[#333]">{proj.title}</p>
                      <p className="text-[10px] font-bold text-zinc-500">{proj.tech} • {proj.years}</p>
                      <p className="text-[10px] leading-relaxed mt-1 text-zinc-600">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {formData.certifications?.length > 0 && (
              <section>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-4" style={{ color: theme.primary }}>
                  Certifications
                </h2>
                <div className="space-y-4">
                  {formData.certifications.map(cert => (
                    <div key={cert.id} className="relative pl-4 border-l-2" style={{ borderColor: theme.primary }}>
                      <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary }} />
                      <p className="text-xs font-black uppercase text-[#333]">{cert.title}</p>
                      <p className="text-[10px] font-bold text-zinc-500">{cert.org} • {cert.year}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Technical Skills */}
            {formData.techSkills && (
              <section>
                <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-6" style={{ color: theme.primary }}>
                  Technical Skills
                </h2>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  {formData.techSkills.languages?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-zinc-800 mb-1 uppercase tracking-tight">
                        Programming Languages
                      </h3>
                      <ul className="space-y-0.5 text-zinc-600">
                        {formData.techSkills.languages.map((lang, index) => (
                          <li key={lang}>
                            •
                            <span
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              onBlur={(e) => handleBlur('techSkills', e.currentTarget.textContent, index, 'languages')}
                              className="outline-none hover:bg-white/10 p-1"
                            >
                              {lang}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {formData.techSkills.frameworks?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-zinc-800 mb-1 uppercase tracking-tight">
                        Frameworks
                      </h3>
                      <ul className="space-y-0.5 text-zinc-600">
                        {formData.techSkills.frameworks.map((fw, index) => (
                          <li key={fw}>
                            •
                            <span
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              onBlur={(e) => handleBlur('techSkills', e.currentTarget.textContent, index, 'frameworks')}
                              className="outline-none hover:bg-white/10 p-1"
                            >
                              {fw}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {formData.techSkills.tools?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-zinc-800 mb-1 uppercase tracking-tight">
                        Tools
                      </h3>
                      <ul className="space-y-0.5 text-zinc-600">
                        {formData.techSkills.tools.map((tool, index) => (
                          <li key={tool}>
                            •
                            <span
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              onBlur={(e) => handleBlur('techSkills', e.currentTarget.textContent, index, 'tools')}
                              className="outline-none hover:bg-white/10 p-1"
                            >
                              {tool}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Contact */}
            <section className="bg-white/60 p-6 rounded-2xl border border-white shadow-sm backdrop-blur-sm">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-4" style={{ color: theme.primary }}>
                Contact
              </h2>
              <div className="space-y-3 text-[11px] font-bold text-zinc-600">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center rounded-full text-white" style={{ backgroundColor: theme.primary }}>✉</div>
                  <span
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('email', e.currentTarget.textContent)}
                    className="outline-none hover:bg-white/10 p-1"
                  >
                    {formData.email}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center rounded-full text-white" style={{ backgroundColor: theme.primary }}>📞</div>
                  <span
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('phone', e.currentTarget.textContent)}
                    className="outline-none hover:bg-white/10 p-1"
                  >
                    {formData.phone}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center rounded-full text-white" style={{ backgroundColor: theme.primary }}>📍</div>
                  <span
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('location', e.currentTarget.textContent)}
                    className="outline-none hover:bg-white/10 p-1"
                  >
                    {formData.location}
                  </span>
                </div>
                {/* Links */}
                {formData.links.portfolio && (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full text-white" style={{ backgroundColor: theme.primary }}>🌐</div>
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('links', e.currentTarget.textContent, null, 'portfolio')}
                      className="outline-none hover:bg-white/10 p-1"
                    >
                      {formData.links.portfolio}
                    </span>
                  </div>
                )}
                {formData.links.github && (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full text-white" style={{ backgroundColor: theme.primary }}>🐙</div>
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('links', e.currentTarget.textContent, null, 'github')}
                      className="outline-none hover:bg-white/10 p-1"
                    >
                      {formData.links.github}
                    </span>
                  </div>
                )}
                {formData.links.linkedin && (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full text-white" style={{ backgroundColor: theme.primary }}>💼</div>
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('links', e.currentTarget.textContent, null, 'linkedin')}
                      className="outline-none hover:bg-white/10 p-1"
                    >
                      {formData.links.linkedin}
                    </span>
                  </div>
                )}
              </div>
            </section>

          </div>
        </div>
      </div>
    );
  };


  const ProfessionalBlackTemplate = ({ formData, accentColor, selectedFont, handleBlur }) => {
    return (
      <div
        className="w-full h-full flex bg-white"
        style={{ fontFamily: selectedFont || 'sans-serif' }}
      >
        {/* LEFT SIDEBAR - Dark Theme */}
        <div className="w-[35%] bg-[#1a1a1a] text-white p-8 flex flex-col gap-10">
          {/* Profile Photo */}
          <div className="w-full flex justify-center">
            <div className="w-44 h-56 bg-zinc-800 overflow-hidden">
              {formData.photo ? (
                <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500 text-xs uppercase font-bold">Photo</div>
              )}
            </div>
          </div>

          {/* About Me Section */}
          <section>
            <h2 className="text-xl font-bold uppercase tracking-wider border-b border-zinc-700 pb-2 mb-4">About Me</h2>
            <p
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleBlur('about', e.currentTarget.textContent)}
              className="text-[11px] leading-relaxed text-zinc-300 text-justify outline-none hover:bg-white/5 p-1 transition-colors"
            >
              {formData.about}
            </p>
          </section>

          {/* Technical Skills Section (Languages from your data) */}
          <section>
            <h2 className="text-xl font-bold uppercase tracking-wider border-b border-zinc-700 pb-2 mb-4">Technical Skills</h2>
            <div className="space-y-4">
              {formData.techSkills.languages.map((skill, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between text-[10px] uppercase mb-1">
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('techSkills', e.currentTarget.textContent, idx, 'languages')}
                      className="outline-none hover:bg-white/10"
                    >
                      {skill}
                    </span>
                  </div>
                  {/* Visual skill bar matching the template image */}
                  <div className="w-full h-[2px] bg-zinc-700 relative">
                    <div className="absolute top-0 left-0 h-full bg-white w-[80%]"></div>
                  </div>
                </div>
              ))}
              {formData.techSkills.frameworks.map((skill, idx) => (
                <div key={`framework-${idx}`} className="group">
                  <div className="flex justify-between text-[10px] uppercase mb-1">
                    <span>{skill}</span>
                  </div>
                  {/* Visual skill bar matching the template image */}
                  <div className="w-full h-[2px] bg-zinc-700 relative">
                    <div className="absolute top-0 left-0 h-full bg-white w-[80%]"></div>
                  </div>
                </div>
              ))}
              {formData.techSkills.tools.map((skill, idx) => (
                <div key={`tool-${idx}`} className="group">
                  <div className="flex justify-between text-[10px] uppercase mb-1">
                    <span>{skill}</span>
                  </div>
                  {/* Visual skill bar matching the template image */}
                  <div className="w-full h-[2px] bg-zinc-700 relative">
                    <div className="absolute top-0 left-0 h-full bg-white w-[80%]"></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact info can also be added here to match the image spacing */}
        </div>

        {/* RIGHT PANEL - White Theme */}
        <div className="flex-1 p-12 flex flex-col gap-12">
          {/* Header with Yellow Accent */}
          <header className="relative">
            <h1
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleBlur('name', e.currentTarget.textContent)}
              className="text-6xl font-black uppercase tracking-tighter text-black outline-none"
            >
              {formData.name}
            </h1>
            {/* The signature yellow line from the image */}
            <div className="h-4 w-48 bg-yellow-400 mt-[-15px] ml-[-10px] relative z-[-1] opacity-90"></div>

            <div className="mt-6 text-zinc-400 text-xs tracking-[0.2em] uppercase space-y-1">
              <p
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleBlur('location', e.currentTarget.textContent)}
                className="outline-none hover:bg-white/10 p-1"
              >
                {formData.location}
              </p>
              <p
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleBlur('phone', e.currentTarget.textContent)}
                className="outline-none hover:bg-white/10 p-1"
              >
                {formData.phone}
              </p>
              <p
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={(e) => handleBlur('email', e.currentTarget.textContent)}
                className="outline-none hover:bg-white/10 p-1"
              >
                {formData.email}
              </p>
            </div>
          </header>

          {/* Education Section */}
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-widest text-black border-b-2 border-black pb-1 mb-6">Education</h2>
            <div className="space-y-6">
              {formData.education.map((edu) => (
                <div key={edu.id}>
                  <h4 className="font-bold text-black text-sm uppercase">
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'institution')}
                      className="outline-none hover:bg-white/10 p-1"
                    >
                      {edu.institution}
                    </span>
                    {' - '}
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'years')}
                      className="outline-none hover:bg-white/10 p-1"
                    >
                      {edu.years}
                    </span>
                  </h4>
                  <p className="text-[11px] leading-relaxed text-zinc-600 mt-1">
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'degree')}
                      className="outline-none hover:bg-white/10 p-1"
                    >
                      {edu.degree}
                    </span>
                    {' • '}
                    <span
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'details')}
                      className="outline-none hover:bg-white/10 p-1"
                    >
                      {edu.details}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Experience Section */}
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-widest text-black border-b-2 border-black pb-1 mb-6">Experience</h2>
            <div className="space-y-8">
              {formData.experience.map((exp) => (
                <div key={exp.id} className="group">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-black text-sm uppercase">
                      <span
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('experience', e.currentTarget.textContent, exp.id, 'position')}
                        className="outline-none hover:bg-white/10 p-1"
                      >
                        {exp.position}
                      </span>
                      {' ('}
                      <span
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('experience', e.currentTarget.textContent, exp.id, 'years')}
                        className="outline-none hover:bg-white/10 p-1"
                      >
                        {exp.years}
                      </span>
                      {')'}
                    </h4>
                  </div>
                  <p
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('experience', e.currentTarget.textContent, exp.id, 'company')}
                    className="text-[11px] text-zinc-500 font-bold mb-2 uppercase tracking-tight outline-none hover:bg-white/10 p-1"
                  >
                    {exp.company}
                  </p>
                  <p
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('experience', e.currentTarget.textContent, exp.id, 'description')}
                    className="text-[11px] leading-relaxed text-zinc-600 outline-none hover:bg-zinc-50 p-1"
                  >
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Projects Section */}
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-widest text-black border-b-2 border-black pb-1 mb-6">Projects</h2>
            <div className="space-y-8">
              {formData.projects.map((proj) => (
                <div key={proj.id} className="group">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-black text-sm uppercase">
                      <span
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('project', e.currentTarget.textContent, proj.id, 'title')}
                        className="outline-none hover:bg-white/10 p-1"
                      >
                        {proj.title}
                      </span>
                      {' ('}
                      <span
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('project', e.currentTarget.textContent, proj.id, 'years')}
                        className="outline-none hover:bg-white/10 p-1"
                      >
                        {proj.years}
                      </span>
                      {')'}
                    </h4>
                  </div>
                  <p
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('project', e.currentTarget.textContent, proj.id, 'tech')}
                    className="text-[11px] text-zinc-500 font-bold mb-2 uppercase tracking-tight outline-none hover:bg-white/10 p-1"
                  >
                    {proj.tech}
                  </p>
                  <p
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('project', e.currentTarget.textContent, proj.id, 'description')}
                    className="text-[11px] leading-relaxed text-zinc-600 outline-none hover:bg-zinc-50 p-1"
                  >
                    {proj.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Certificates Section */}
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-widest text-black border-b-2 border-black pb-1 mb-6">Certificates</h2>
            <div className="space-y-6">
              {formData.certifications.map((cert) => (
                <div key={cert.id}>
                  <h4
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('certification', e.currentTarget.textContent, cert.id, 'title')}
                    className="font-bold text-black text-sm uppercase outline-none hover:bg-white/10 p-1"
                  >
                    {cert.title} - {cert.year}
                  </h4>
                  <p
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleBlur('certification', e.currentTarget.textContent, cert.id, 'org')}
                    className="text-[11px] leading-relaxed text-zinc-600 mt-1 outline-none hover:bg-white/10 p-1"
                  >
                    {cert.org}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  };

  const ModernPlayfulTemplate = ({ formData, accentColor, selectedFont }) => {
    // Generate a soft version of the accent color for the background halo
    const haloColor = getLightColor(accentColor, 0.15);

    return (
      <div className="w-full h-full bg-[#E5E7EB] p-6 font-sans text-[#1F2937] relative overflow-hidden" style={{ fontFamily: selectedFont }}>
        {/* 1. TOP SECTION: HEADER & PHOTO HALO */}
        <div className="relative flex items-start mb-8 gap-8">
          <div className="z-10 max-w-md">
            <h1 className="text-6xl font-black tracking-tight leading-tight transition-colors" style={{ color: accentColor }}>
              Hello... I'm<br />{formData.name || "Varun Vishal"}
            </h1>
            <p className="text-xl font-bold mt-2 text-slate-700">{formData.title || "UI&UX Designer"}</p>
            <p className="text-[11px] leading-relaxed mt-4 text-slate-600 max-w-sm">
              {formData.about}
            </p>

            {/* CONTACT PILLS */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full text-white shadow-md" style={{ backgroundColor: accentColor }}>
                  <Phone size={14} />
                </div>
                <span className="text-[10px] font-bold">{formData.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full text-white shadow-md transition-colors" style={{ backgroundColor: accentColor }}>
                  <Mail size={14} />
                </div>
                <span className="text-[10px] font-bold">{formData.email}</span>
              </div>
            </div>
          </div>

          {/* PROFILE PHOTO WITH HALO */}
          <div className="relative" style={{ marginLeft: '3rem' }}>
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full z-0"
              style={{ backgroundColor: haloColor }}
            />
            <div
              className="relative z-10 w-64 h-64 rounded-full border-[10px] border-white shadow-2xl overflow-hidden transition-colors"
              style={{ borderColor: accentColor }}
            >
              {formData.photo ? (
                <img src={formData.photo} alt="Profile" className="w-full h-full object-cover object-center" />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">Photo</div>
              )}
            </div>
          </div>
        </div>

        {/* 2. BODY SECTION: TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-8 space-y-6">
            <section>
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Work Experience</h2>
              <div className="grid grid-cols-2 gap-6">
                {formData.experience.map(exp => (
                  <div key={exp.id}>
                    <p className="text-xs font-bold mb-1" style={{ color: accentColor }}>{exp.years}</p>
                    <p className="text-xs font-black uppercase mb-1">{exp.company}</p>
                    <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase">{exp.position}</p>
                    <p className="text-[10px] leading-relaxed text-slate-600">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Education</h2>
              <div className="space-y-6">
                {formData.education.map(edu => (
                  <div key={edu.id} className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ backgroundColor: accentColor }} />
                    <div>
                      <p
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'years')}
                        className="text-xs font-bold outline-none hover:bg-white/10 p-1"
                        style={{ color: accentColor }}
                      >
                        {edu.years}
                      </p>
                      <p
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'institution')}
                        className="text-xs font-black uppercase outline-none hover:bg-white/10 p-1"
                      >
                        {edu.institution}
                      </p>
                      <p
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'degree')}
                        className="text-[10px] text-slate-500 font-bold uppercase outline-none hover:bg-white/10 p-1"
                      >
                        {edu.degree}
                      </p>
                      {(edu.percentage || edu.cgpa) && (
                        <p className="text-[10px] text-slate-500">
                          {edu.cgpa && (
                            <>
                              CGPA:
                              <span
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'cgpa')}
                                className="outline-none hover:bg-white/10 p-1"
                              >
                                {edu.cgpa}
                              </span>
                            </>
                          )}
                          {edu.cgpa && edu.percentage && ' • '}
                          {edu.percentage && (
                            <>
                              Percentage:
                              <span
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => handleBlur('education', e.currentTarget.textContent, edu.id, 'percentage')}
                                className="outline-none hover:bg-white/10 p-1"
                              >
                                {edu.percentage}
                              </span>
                            </>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: PROJECTS, CERTIFICATES & TECHNICAL SKILLS */}
          <div className="col-span-4 space-y-6">
            <section>
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Projects</h2>
              <div className="space-y-4">
                {formData.projects.map(proj => (
                  <div key={proj.id} className="bg-white/50 p-3 rounded-xl">
                    <p className="text-xs font-bold mb-1" style={{ color: accentColor }}>{proj.title}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{proj.tech}</p>
                    <p className="text-[10px] leading-relaxed text-slate-600">{proj.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Certificates</h2>
              <div className="space-y-4">
                {formData.certifications.map(cert => (
                  <div key={cert.id} className="bg-white/50 p-3 rounded-xl">
                    <p className="text-xs font-bold mb-1" style={{ color: accentColor }}>{cert.title}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{cert.org}</p>
                    <p className="text-[10px] text-slate-500">{cert.year}</p>
                  </div>
                ))}
              </div>
            </section>


          </div>
        </div>

        {/* Technical Skills (categorized) */}
        {formData.techSkills && (
          <section className="mt-4" style={{ pageBreakInside: 'avoid' }}>
            <h2 className="bg-black text-white px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.35em] mb-6 shadow-sm">
              Technical Skills
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
              {formData.techSkills.languages?.length > 0 && (
                <div>
                  <h3 className="font-bold text-zinc-800 mb-1 uppercase tracking-tight">
                    Programming Languages
                  </h3>
                  <ul className="space-y-0.5 text-zinc-600">
                    {formData.techSkills.languages.map((lang) => (
                      <li key={lang}>• {lang}</li>
                    ))}
                  </ul>
                </div>
              )}
              {formData.techSkills.frameworks?.length > 0 && (
                <div>
                  <h3 className="font-bold text-zinc-800 mb-1 uppercase tracking-tight">
                    Frameworks
                  </h3>
                  <ul className="space-y-0.5 text-zinc-600">
                    {formData.techSkills.frameworks.map((fw) => (
                      <li key={fw}>• {fw}</li>
                    ))}
                  </ul>
                </div>
              )}
              {formData.techSkills.tools?.length > 0 && (
                <div>
                  <h3 className="font-bold text-zinc-800 mb-1 uppercase tracking-tight">
                    Tools
                  </h3>
                  <ul className="space-y-0.5 text-zinc-600">
                    {formData.techSkills.tools.map((tool) => (
                      <li key={tool}>• {tool}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

      </div>
    );
  };

  return (
    <div className="min-h-screen flex relative bg-gray-50 text-black">

      {/* Guidance Button */}
      <button
        onClick={() => setShowGuidance(true)}
        className="fixed top-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors duration-200"
        title="How to use this app"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Guidance Modal */}
      {showGuidance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">How to Use Resume Builder</h2>
                <button
                  onClick={() => setShowGuidance(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6 text-gray-700">
                <section>
                  <h3 className="text-lg font-semibold mb-2">🚀 Getting Started</h3>
                  <p className="mb-2">1. Choose a template from the gallery by clicking on any design.</p>
                  <p>2. Enter your name and job title in the preview section.</p>
                  <p>3. Click "Back to Templates" if you want to try a different design.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">✏️ Customizing Your Resume</h3>
                  <p className="mb-2">Use the left sidebar to:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Change accent colors and panel colors</li>
                    <li>Select different fonts</li>
                    <li>Fill in your personal information, experience, education, projects, etc.</li>
                    <li>Add or remove items using the + and - buttons</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">💾 Auto-Save Feature</h3>
                  <p>Your work is automatically saved to your browser's local storage. No need to worry about losing progress if you refresh the page!</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">📁 Save/Load Project</h3>
                  <p className="mb-2">• Click "Save Data" to download your resume data as a JSON file.</p>
                  <p>• Click "Load Data" to upload a previously saved JSON file and continue editing.</p>
                  <p>This is perfect for creating multiple resume versions!</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">🔍 Zoom Controls</h3>
                  <p>Use the floating zoom controls in the bottom-right of the preview to zoom in/out for better editing on smaller screens.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">📄 Downloading Your Resume</h3>
                  <p>Click "Download PDF" to generate and download your resume as a high-quality PDF file.</p>
                </section>



                <section>
                  <h3 className="text-lg font-semibold mb-2">💡 Tips</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Upload a professional photo for better impact</li>
                    <li>Use the color picker for custom accent colors</li>
                    <li>Experiment with different templates to find your style</li>
                    <li>Keep your content concise and impactful</li>
                  </ul>
                </section>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowGuidance(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Helper for Editor Mode */}
      {currentView === 'editor' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-4 py-2 rounded-full shadow-lg z-50 animate-bounce">
          👆 Tip: Click directly on the resume text to edit!
        </div>
      )}

      {/* Customization Panel */}
      <div className="w-80 shadow-lg overflow-y-auto h-screen sticky top-0 bg-white text-black">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Resume Builder</h1>
            <p className="text-sm mt-1 text-gray-600">Customize your resume</p>
          </div>

          {currentView === 'editor' && (
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentView('gallery')}
                className="text-[10px] bg-slate-700 text-white px-3 py-1 rounded-full hover:bg-slate-600"
              >
                ← Back to Templates
              </button>
            </div>
          )}

          {/* Accent Color */}
          <div>
            <h3 className="text-sm font-semibold text-black mb-3">Accent Color</h3>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setAccentColor(color.hex)}
                  className={`w-8 h-8 rounded-full border-2 ${accentColor === color.hex ? 'border-gray-800' : 'border-gray-300'
                    }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Custom Accent Color Picker */}
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-gray-200 shadow-2xl">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700 mb-6">
              Accent Color
            </label>

            <div className="relative flex items-center justify-center cursor-pointer group">
              {/* THE RAINBOW RING (The Spectrum) */}
              <div
                className="w-24 h-24 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: `conic-gradient(
                    #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80,
                    #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000
                  )`
                }}
              />

              {/* THE INNER CIRCLE (Creates the 'Donut' effect) */}
              <div className="absolute w-[65%] h-[65%] bg-white rounded-full flex items-center justify-center border border-gray-300 shadow-inner">
                {/* CENTER INDICATOR (Shows selected color) */}
                <div
                  className="w-6 h-6 rounded-full shadow-md transition-all duration-300 border border-gray-400"
                  style={{ backgroundColor: accentColor }}
                />
              </div>

              {/* THE FUNCTIONAL INPUT (Invisible overlay) */}
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
              />
            </div>

            {/* HEX LABEL */}
            <span className="mt-5 text-[10px] font-mono font-bold text-gray-600 tracking-tighter uppercase opacity-60">
              {accentColor}
            </span>
          </div>

          {/* Grayscale Mode Button - Only visible for Modern Playful template */}
          {selectedTemplate === 'playful' && (
            <div className="mt-4">
              <button
                onClick={() => setAccentColor('#000000')}
                className="w-full p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition-colors duration-200"
              >
                Grayscale Mode
              </button>
            </div>
          )}

          {/* Font Selection */}
          <div>
            <h3 className="text-sm font-semibold text-black mb-3">Font Style</h3>
            <select
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          {/* Template Note */}
          {selectedTemplate === 'accountant' && (
            <div className="mt-4 p-3 bg-white/10 rounded">
              <p className="text-[10px] text-gray-400 mb-2">Note: This template uses a specific Garet font style for maximum professionalism.</p>
            </div>
          )}

          {/* Panel Colors */}
          <div>
            <h3 className="text-sm font-semibold text-black mb-3">Left Panel Color</h3>
            <div className="grid grid-cols-4 gap-2">
              {panelColorOptions.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setLeftPanelColor(color.hex)}
                  className={`w-8 h-8 rounded-full border-2 ${leftPanelColor === color.hex ? 'border-gray-800' : 'border-gray-300'
                    }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-black mb-3">Right Panel Color</h3>
            <div className="grid grid-cols-4 gap-2">
              {panelColorOptions.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => setRightPanelColor(color.hex)}
                  className={`w-8 h-8 rounded-full border-2 ${rightPanelColor === color.hex ? 'border-gray-800' : 'border-gray-300'
                    }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold text-black mb-3">Personal Information</h3>
            <div className="space-y-3">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Full Name"
                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
              />
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Job Title"
                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
              />
              <textarea
                name="about"
                value={formData.about}
                onChange={handleInputChange}
                placeholder="About Me"
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
              />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone"
                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
              />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Location"
                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
              />
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-black mb-3">Links</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={formData.links.portfolio}
                onChange={(e) => handleLinksChange('portfolio', e.target.value)}
                placeholder="Portfolio URL"
                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
              />
              <input
                type="text"
                value={formData.links.github}
                onChange={(e) => handleLinksChange('github', e.target.value)}
                placeholder="GitHub URL"
                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
              />
              <input
                type="text"
                value={formData.links.linkedin}
                onChange={(e) => handleLinksChange('linkedin', e.target.value)}
                placeholder="LinkedIn URL"
                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
              />
            </div>
          </div>

          {/* Experience */}
          <div>
            <h3 className="text-sm font-semibold text-black mb-3">Experience</h3>
            {formData.experience.map((exp, index) => (
              <div key={exp.id} className="space-y-3 mb-4 p-3 border border-gray-200 rounded-md">
                <input
                  type="text"
                  value={exp.position}
                  onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                  placeholder="Position"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                />
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                  placeholder="Company"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                />
                <input
                  type="text"
                  value={exp.years}
                  onChange={(e) => updateExperience(exp.id, 'years', e.target.value)}
                  placeholder="Years"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                />
                <textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                  placeholder="Description"
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                />
                <button
                  onClick={() => deleteExperience(exp.id)}
                  className="w-full p-2 bg-red-500 text-white rounded-md text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
            <button
              onClick={addExperience}
              className="w-full p-2 bg-blue-500 text-white rounded-md text-sm"
            >
              Add Experience
            </button>
          </div>

          {/* Projects */}
          <div>
            <h3 className="text-sm font-semibold text-black mb-3">Projects</h3>
            {formData.projects.map((proj, index) => (
              <div key={proj.id} className="space-y-3 mb-4 p-3 border border-gray-200 rounded-md">
                <input
                  type="text"
                  value={proj.title}
                  onChange={(e) => updateProject(proj.id, 'title', e.target.value)}
                  placeholder="Project Title"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                />
                <input
                  type="text"
                  value={proj.tech}
                  onChange={(e) => updateProject(proj.id, 'tech', e.target.value)}
                  placeholder="Technologies"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                />
                <input
                  type="text"
                  value={proj.years}
                  onChange={(e) => updateProject(proj.id, 'years', e.target.value)}
                  placeholder="Years"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                />
                <textarea
                  value={proj.description}
                  onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                  placeholder="Description"
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                />
                <button
                  onClick={() => deleteProject(proj.id)}
                  className="w-full p-2 bg-red-500 text-white rounded-md text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
            <button
              onClick={addProject}
              className="w-full p-2 bg-blue-500 text-white rounded-md text-sm"
            >
              Add Project
            </button>
          </div>

          {/* Education */}
          <div>
            <h3 className="text-sm font-semibold text-black mb-3">Education</h3>
            {formData.education.map((edu, index) => (
              <div key={edu.id} className="space-y-3 mb-4 p-3 border border-gray-200 rounded-md">
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                  placeholder="Institution"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                />
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                  placeholder="Degree"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                />
                <input
                  type="text"
                  value={edu.years}
                  onChange={(e) => updateEducation(edu.id, 'years', e.target.value)}
                  placeholder="Years"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                />
                <input
                  type="text"
                  value={edu.percentage}
                  onChange={(e) => updateEducation(edu.id, 'percentage', e.target.value)}
                  placeholder="Percentage"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                />
                <input
                  type="text"
                  value={edu.cgpa}
                  onChange={(e) => updateEducation(edu.id, 'cgpa', e.target.value)}
                  placeholder="CGPA"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                />
                <textarea
                  value={edu.details}
                  onChange={(e) => updateEducation(edu.id, 'details', e.target.value)}
                  placeholder="Details"
                  rows="2"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                />
                <button
                  onClick={() => deleteEducation(edu.id)}
                  className="w-full p-2 bg-red-500 text-white rounded-md text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
            <button
              onClick={addEducation}
              className="w-full p-2 bg-blue-500 text-white rounded-md text-sm"
            >
              Add Education
            </button>
          </div>

          {/* Certifications */}
          <div>
            <h3 className="text-sm font-semibold text-black mb-3">Certifications</h3>
            {formData.certifications.map((cert, index) => (
              <div key={cert.id} className="space-y-3 mb-4 p-3 border border-gray-200 rounded-md">
                <input
                  type="text"
                  value={cert.title}
                  onChange={(e) => updateCertification(cert.id, 'title', e.target.value)}
                  placeholder="Certification Title"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                />
                <input
                  type="text"
                  value={cert.org}
                  onChange={(e) => updateCertification(cert.id, 'org', e.target.value)}
                  placeholder="Organization"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                />
                <input
                  type="text"
                  value={cert.year}
                  onChange={(e) => updateCertification(cert.id, 'year', e.target.value)}
                  placeholder="Year"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                />
                <button
                  onClick={() => deleteCertification(cert.id)}
                  className="w-full p-2 bg-red-500 text-white rounded-md text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
            <button
              onClick={addCertification}
              className="w-full p-2 bg-blue-500 text-white rounded-md text-sm"
            >
              Add Certification
            </button>
          </div>

          {/* Technical Skills */}
          <div>
            <h3 className="text-sm font-semibold text-black mb-3">Technical Skills</h3>

            {/* Languages */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-black mb-2">Languages</h4>
              {formData.techSkills.languages.map((lang, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={lang}
                    onChange={(e) => {
                      const newLanguages = [...formData.techSkills.languages];
                      newLanguages[index] = e.target.value;
                      setFormData({ ...formData, techSkills: { ...formData.techSkills, languages: newLanguages } });
                    }}
                    placeholder="Language"
                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm bg-white"
                  />
                  <button
                    onClick={() => {
                      const newLanguages = formData.techSkills.languages.filter((_, i) => i !== index);
                      setFormData({ ...formData, techSkills: { ...formData.techSkills, languages: newLanguages } });
                    }}
                    className="px-3 py-2 bg-red-500 text-white rounded-md text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newLanguages = [...formData.techSkills.languages, ""];
                  setFormData({ ...formData, techSkills: { ...formData.techSkills, languages: newLanguages } });
                }}
                className="w-full p-2 bg-blue-500 text-white rounded-md text-sm"
              >
                Add Language
              </button>
            </div>

            {/* Frameworks */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-black mb-2">Frameworks</h4>
              {formData.techSkills.frameworks.map((fw, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={fw}
                    onChange={(e) => {
                      const newFrameworks = [...formData.techSkills.frameworks];
                      newFrameworks[index] = e.target.value;
                      setFormData({ ...formData, techSkills: { ...formData.techSkills, frameworks: newFrameworks } });
                    }}
                    placeholder="Framework"
                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm bg-white"
                  />
                  <button
                    onClick={() => {
                      const newFrameworks = formData.techSkills.frameworks.filter((_, i) => i !== index);
                      setFormData({ ...formData, techSkills: { ...formData.techSkills, frameworks: newFrameworks } });
                    }}
                    className="px-3 py-2 bg-red-500 text-white rounded-md text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newFrameworks = [...formData.techSkills.frameworks, ""];
                  setFormData({ ...formData, techSkills: { ...formData.techSkills, frameworks: newFrameworks } });
                }}
                className="w-full p-2 bg-blue-500 text-white rounded-md text-sm"
              >
                Add Framework
              </button>
            </div>

            {/* Tools */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-black mb-2">Tools</h4>
              {formData.techSkills.tools.map((tool, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tool}
                    onChange={(e) => {
                      const newTools = [...formData.techSkills.tools];
                      newTools[index] = e.target.value;
                      setFormData({ ...formData, techSkills: { ...formData.techSkills, tools: newTools } });
                    }}
                    placeholder="Tool"
                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm bg-white"
                  />
                  <button
                    onClick={() => {
                      const newTools = formData.techSkills.tools.filter((_, i) => i !== index);
                      setFormData({ ...formData, techSkills: { ...formData.techSkills, tools: newTools } });
                    }}
                    className="px-3 py-2 bg-red-500 text-white rounded-md text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newTools = [...formData.techSkills.tools, ""];
                  setFormData({ ...formData, techSkills: { ...formData.techSkills, tools: newTools } });
                }}
                className="w-full p-2 bg-blue-500 text-white rounded-md text-sm"
              >
                Add Tool
              </button>
            </div>
          </div>

          {/* Languages */}
          <div>
            <h3 className="text-sm font-semibold text-black mb-3">Languages</h3>
            {formData.languages.map((lang, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={lang}
                  onChange={(e) => handleLanguageChange(index, e.target.value)}
                  placeholder="Language"
                  className="flex-1 p-2 border border-gray-300 rounded-md text-sm bg-white"
                />
                <button
                  onClick={() => deleteLanguage(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addLanguage}
              className="w-full p-2 bg-blue-500 text-white rounded-md text-sm"
            >
              Add Language
            </button>
          </div>

          {/* Expertise */}
          <div>
            <h3 className="text-sm font-semibold text-black mb-3">Expertise</h3>
            {formData.expertise.map((exp, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={exp}
                  onChange={(e) => handleExpertiseChange(index, e.target.value)}
                  placeholder="Expertise"
                  className="flex-1 p-2 border border-gray-300 rounded-md text-sm bg-white"
                />
                <button
                  onClick={() => deleteExpertise(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addExpertise}
              className="w-full p-2 bg-blue-500 text-white rounded-md text-sm"
            >
              Add Expertise
            </button>
          </div>



          {/* Save/Load Project */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
            <button
              onClick={exportData}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold py-2 rounded flex items-center justify-center gap-2"
            >
              💾 Save Data
            </button>
            <label className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold py-2 rounded flex items-center justify-center gap-2 cursor-pointer">
              📂 Load Data
              <input type="file" className="hidden" accept=".json" onChange={importData} />
            </label>
          </div>



          {/* Download PDF */}
          <div>
            <button
              onClick={downloadPDF}
              className="w-full p-2 bg-green-500 text-white rounded-md text-sm"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 h-full bg-zinc-200 overflow-y-auto">
        {currentView === 'gallery' ? (
          <div className="p-12 w-full max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div onClick={() => { setSelectedTemplate('modern'); setCurrentView('editor'); }} className="cursor-pointer hover:scale-105 transition-all shadow-xl rounded-lg overflow-hidden bg-white">
                <div className="w-full h-48 flex">
                  <div className="w-1/3 bg-[#E8DCC4]"></div>
                  <div className="w-2/3 bg-white p-4">
                    <div className="h-2 w-12 bg-[#2D3E50] mb-2"></div>
                    <div className="h-4 w-20 bg-zinc-200 mb-1"></div>
                    <div className="h-3 w-16 bg-zinc-100"></div>
                  </div>
                </div>
                <div className="p-4 font-bold text-center bg-[#2D3E50] text-white">Modern</div>
              </div>
              <div onClick={() => { setSelectedTemplate('creative'); setCurrentView('editor'); }} className="cursor-pointer hover:scale-105 transition-all shadow-xl rounded-lg overflow-hidden bg-white">
                <div className="w-full h-48 flex">
                  <div className="w-1/3 bg-[#E8DCC4]"></div>
                  <div className="w-2/3 bg-white p-4">
                    <div className="h-2 w-12 bg-emerald-700 mb-2"></div>
                    <div className="h-4 w-20 bg-zinc-200 mb-1"></div>
                    <div className="h-3 w-16 bg-zinc-100"></div>
                  </div>
                </div>
                <div className="p-4 font-bold text-center bg-emerald-700 text-white">Creative Green</div>
              </div>
              <div onClick={() => { setSelectedTemplate('geometric'); setCurrentView('editor'); }} className="cursor-pointer hover:scale-105 transition-all shadow-xl rounded-lg overflow-hidden bg-white">
                <div className="w-full h-48 flex">
                  <div className="w-1/3 bg-blue-600"></div>
                  <div className="w-2/3 bg-white p-4">
                    <div className="h-2 w-12 bg-blue-600 mb-2"></div>
                    <div className="h-4 w-20 bg-zinc-200 mb-1"></div>
                    <div className="h-3 w-16 bg-zinc-100"></div>
                  </div>
                </div>
                <div className="p-4 font-bold text-center bg-blue-600 text-white">Blue Geometric</div>
              </div>
              <div onClick={() => { setSelectedTemplate('retro'); setCurrentView('editor'); }} className="cursor-pointer hover:scale-105 transition-all shadow-xl rounded-lg overflow-hidden bg-white">
                <div className="w-full h-48 flex">
                  <div className="w-1/3 bg-[#E8A87C]"></div>
                  <div className="w-2/3 bg-[#FFFBF2] p-4">
                    <div className="h-2 w-12 bg-[#E8A87C] mb-2"></div>
                    <div className="h-4 w-20 bg-zinc-200 mb-1"></div>
                    <div className="h-3 w-16 bg-zinc-100"></div>
                  </div>
                </div>
                <div className="p-4 font-bold text-center bg-[#E8A87C] text-white">Playful Retro</div>
              </div>
              <div onClick={() => { setSelectedTemplate('accountant'); setCurrentView('editor'); }} className="cursor-pointer hover:scale-105 transition-all shadow-xl rounded-lg overflow-hidden bg-white">
                <div className="w-full h-48 bg-[#fcfcfc] p-4">
                  <div className="h-2 w-12 bg-[#303030] mb-2"></div>
                  <div className="h-4 w-20 bg-zinc-200 mb-1"></div>
                  <div className="h-3 w-16 bg-zinc-100"></div>
                </div>
                <div className="p-4 font-bold text-center bg-[#303030] text-white">Minimalist Accountant</div>
              </div>
              <div onClick={() => { setSelectedTemplate('playful'); setCurrentView('editor'); }} className="cursor-pointer hover:scale-105 transition-all shadow-xl rounded-lg overflow-hidden bg-white">
                <div className="w-full h-48 bg-[#E5E7EB] p-4">
                  <div className="h-2 w-12 bg-[#2D3E50] mb-2"></div>
                  <div className="h-4 w-20 bg-zinc-200 mb-1"></div>
                  <div className="h-3 w-16 bg-zinc-100"></div>
                </div>
                <div className="p-4 font-bold text-center bg-[#2D3E50] text-white">Modern Playful</div>
              </div>
              <div onClick={() => { setSelectedTemplate('new-retro'); setCurrentView('editor'); }} className="cursor-pointer hover:scale-105 transition-all shadow-xl rounded-lg overflow-hidden bg-white">
                <div className="w-full h-48 bg-[#FFFBF2] p-4">
                  <div className="h-2 w-12 bg-[#E8A87C] mb-2"></div>
                  <div className="h-4 w-20 bg-zinc-200 mb-1"></div>
                  <div className="h-3 w-16 bg-zinc-100"></div>
                </div>
                <div className="p-4 font-bold text-center bg-[#E8A87C] text-white">New Playful Retro</div>
              </div>
              <div onClick={() => { setSelectedTemplate('professional-black'); setCurrentView('editor'); }} className="cursor-pointer hover:scale-105 transition-all shadow-xl rounded-lg overflow-hidden bg-white">
                <div className="w-full h-48 flex">
                  <div className="w-1/3 bg-[#1a1a1a]"></div>
                  <div className="w-2/3 bg-white p-4">
                    <div className="h-2 w-12 bg-yellow-400 mb-2"></div>
                    <div className="h-4 w-20 bg-zinc-200 mb-1"></div>
                    <div className="h-3 w-16 bg-zinc-100"></div>
                  </div>
                </div>
                <div className="p-4 font-bold text-center bg-black text-white">Professional Contrast</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex">
            {/* Resume Preview - Left Side */}
            <div className="flex-1 flex items-center justify-center">
              <div
                ref={resumeRef}
                className="w-[210mm] h-[297mm] shadow-2xl flex-shrink-0 bg-white overflow-hidden transition-all duration-300 origin-top"
                style={{
                  fontFamily: selectedFont
                }}
              >
                {selectedTemplate === 'modern' && <ModernTemplate formData={formData} accentColor={accentColor} leftPanelColor={leftPanelColor} rightPanelColor={rightPanelColor} selectedFont={selectedFont} />}
                {selectedTemplate === 'creative' && <CreativeGreenTemplate formData={formData} accentColor={accentColor} leftPanelColor={leftPanelColor} rightPanelColor={rightPanelColor} selectedFont={selectedFont} />}
                {selectedTemplate === 'geometric' && <BlueGeometricTemplate formData={formData} accentColor={accentColor} selectedFont={selectedFont} />}
                {selectedTemplate === 'retro' && <PlayfulRetroTemplate formData={formData} accentColor={accentColor} selectedFont={selectedFont} />}
                {selectedTemplate === 'accountant' && <MinimalistAccountantTemplate formData={formData} accentColor={accentColor} selectedFont={selectedFont} />}
                {selectedTemplate === 'playful' && <ModernPlayfulTemplate formData={formData} accentColor={accentColor} selectedFont={selectedFont} />}
                {selectedTemplate === 'new-retro' && <NewPlayfulRetroTemplate formData={formData} accentColor={accentColor} selectedFont={selectedFont} />}
        {selectedTemplate === 'professional-black' && <ProfessionalBlackTemplate formData={formData} accentColor={accentColor} selectedFont={selectedFont} handleBlur={handleBlur} />}

      </div>



      {/* ZOOM CONTROLS */}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-full border border-white/20 shadow-xl">
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="w-6 h-6 flex items-center justify-center text-white hover:bg-white/20 rounded-full">-</button>
                <span className="text-[10px] text-black font-mono w-8 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="w-6 h-6 flex items-center justify-center text-white hover:bg-white/20 rounded-full">+</button>
              </div>
            </div>

            {/* AI Suggestions Panel - Right Side */}
            <div className="w-80 overflow-y-auto h-full bg-gray-50 text-black p-4">
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    AI Assistant
                  </div>
                  <p className="text-xs mt-2 text-gray-600">Created By KRISH PATEL</p>
                </div>

                {/* API Key Section */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-800">API Key</h4>
                  </div>
                  <label className="block text-xs font-medium mb-2 text-gray-600">Enter your key here.....</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter API key or leave empty to use .env"
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-purple-300 transition-colors"
                  />
                </div>

                {/* Resume Summary Section */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-800">Resume Summary</h4>
                  </div>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={aiSuggestionLoading}
                    className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {aiSuggestionLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd"/>
                        </svg>
                        Generate Resume Summary
                      </>
                    )}
                  </button>
                  {summaryText && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <p className="text-xs font-semibold text-green-800 mb-2">Generated Summary:</p>
                      <p className="text-xs text-gray-700 mb-3">{summaryText}</p>
                      <button
                        onClick={() => setFormData({ ...formData, about: summaryText })}
                        className="w-full px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-semibold transition-colors"
                      >
                        Use This Summary
                      </button>
                    </div>
                  )}
                </div>

                {/* Skills Section */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-800">Skills</h4>
                  </div>
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Enter a skill (e.g., React)"
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-blue-300 transition-colors mb-3"
                  />
                  <div className="text-xs text-gray-500 mb-3">
                    <span className="font-medium">Examples:</span> React, Python, UI/UX, Data Analysis
                  </div>
                  <button
                    onClick={handleSuggestSkills}
                    disabled={aiSuggestionLoading || !skillInput.trim()}
                    className="w-full p-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {aiSuggestionLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Suggesting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd"/>
                        </svg>
                        Suggest Related Skills
                      </>
                    )}
                  </button>
                  {suggestedSkills.length > 0 && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-semibold text-blue-800 mb-2">Suggested Skills:</p>
                      <div className="space-y-2">
                        {suggestedSkills.map((skill, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                            <span className="text-xs text-gray-700">{skill}</span>
                            <button
                              onClick={() => addSuggestedSkill(skill)}
                              className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-semibold transition-colors"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bullet Points Section */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd"/>
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-800">Bullet Points</h4>
                  </div>
                  <input
                    type="text"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    placeholder="Job Role (e.g., Software Engineer)"
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-indigo-300 transition-colors mb-2"
                  />
                  <input
                    type="text"
                    value={companyInput}
                    onChange={(e) => setCompanyInput(e.target.value)}
                    placeholder="Company Name"
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-indigo-300 transition-colors mb-3"
                  />
                  <div className="text-xs text-gray-500 mb-3">
                    <span className="font-medium">Examples:</span> Frontend Developer, Google, Microsoft
                  </div>
                  <button
                    onClick={handleSuggestBullets}
                    disabled={aiSuggestionLoading || !roleInput.trim() || !companyInput.trim()}
                    className="w-full p-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {aiSuggestionLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd"/>
                        </svg>
                        Suggest Bullet Points
                      </>
                    )}
                  </button>
                  {suggestedBullets.length > 0 && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                      <p className="text-xs font-semibold text-indigo-800 mb-2">Suggested Bullet Points:</p>
                      <div className="space-y-2">
                        {suggestedBullets.map((bullet, index) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-white rounded border">
                            <span className="text-xs text-gray-700 flex-1 leading-relaxed">{bullet}</span>
                            <button
                              onClick={() => addSuggestedBullet(bullet)}
                              className="px-2 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded text-xs font-semibold transition-colors flex-shrink-0"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Improvement Section */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <h4 className="text-sm font-semibold text-gray-800">Content Improvement</h4>
                  </div>
                  <textarea
                    value={improveInput}
                    onChange={(e) => setImproveInput(e.target.value)}
                    placeholder="Paste existing bullet point to improve"
                    rows="3"
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-orange-300 transition-colors mb-3 resize-none"
                  />
                  <button
                    onClick={handleImproveContent}
                    disabled={aiSuggestionLoading || !improveInput.trim()}
                    className="w-full p-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {aiSuggestionLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Improving...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        Improve Content
                      </>
                    )}
                  </button>
                  {improvedText && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                      <p className="text-xs font-semibold text-orange-800 mb-2">Improved Version:</p>
                      <p className="text-xs text-gray-700 mb-3">{improvedText}</p>
                      <button
                        onClick={() => setImproveInput(improvedText)}
                        className="w-full px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-semibold transition-colors"
                      >
                        Use This
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>


    </div>
  );
};

export default App;
