const fs = require('fs');
const path = require('path');

const files = [
  'pages/user/SettingsPage.jsx',
  'pages/user/editor/ExhibitionSection.jsx',
  'pages/user/editor/ExperienceSection.jsx',
  'pages/user/editor/EducationSection.jsx',
  'pages/user/editor/GenericSection.jsx',
  'pages/user/editor/FinancialCredentialSection.jsx',
  'pages/user/editor/MediaAppearanceSection.jsx',
  'pages/user/ResumesPage.jsx',
  'pages/user/editor/CertificationSection.jsx',
  'pages/user/editor/ProjectGallerySection.jsx',
  'pages/user/editor/PublicationSection.jsx',
  'pages/user/editor/SectionsConfigPanel.jsx',
  'pages/user/ResumeEditorPage.jsx',
  'pages/user/editor/ServiceSection.jsx',
  'pages/user/editor/SkillSection.jsx',
  'pages/user/Dashboard.jsx',
  'pages/user/editor/BlogSection.jsx',
  'pages/user/editor/TestimonialSection.jsx',
  'pages/public/PublicPortfolioPage.jsx'
];

files.forEach(f => {
  const fullPath = path.join(__dirname, f);
  if(fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const newContent = content.replace(/^\/\/( )?/gm, '');
    fs.writeFileSync(fullPath, newContent);
    console.log('Fixed ' + f);
  } else {
    console.log('Not found: ' + f);
  }
});
