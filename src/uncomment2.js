const fs = require('fs');
const path = require('path');

const files = [
  'Dashboard.jsx',
  'TemplatesPage.jsx',
  'AnalyticsPage.jsx',
  'ContactsPage.jsx'
];

files.forEach(f => {
  const fullPath = path.join('s:/project-4/Project-4-Frontend-Resume/src/pages/users', f);
  if(fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const newContent = content.replace(/^\/\/( )?/gm, '');
    fs.writeFileSync(fullPath, newContent);
    console.log('Fixed ' + f);
  } else {
    console.log('Not found: ' + f);
  }
});
