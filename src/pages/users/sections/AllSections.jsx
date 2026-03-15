/**
 * All remaining section components.
 * Each one is a separate default export placed in users/sections/
 *
 * IMPORTANT path notes carried over from backend:
 * - Projects reorder: POST /api/projects/reorder/{resumeId}  ← POST not PUT!
 * - Projects delete: returns ok() not noContent()
 * - Publications reorder: POST /api/publications/reorder/{resumeId}  ← POST not PUT!
 * - Publications delete: returns ok() not noContent()
 * - Skills reorder: PUT /api/skills/reorder/{resumeId}
 * - Testimonials reorder: PUT /api/testimonials/reorder/{resumeId}
 * - ServiceOffering: NO reorder endpoint
 * - Blogs: NO reorder endpoint
 * - visibility in blogs: "Draft" | "Public" (string, NOT enum)
 * - Testimonials: verified=false always on create, public only shows verified=true
 */

import { useState, useEffect } from "react";
import {
  Field, Input, Textarea, Select, Toggle,
  FileUpload, FormActions, FormGrid, ErrorBox,
  ItemCard, AddBtn, SectionLoader, SectionEmpty, FormGrid as Grid,
} from "../sectionAtoms";

/* ════════════════════════════════════════════════════════════════
   PROJECTS SECTION
   POST /api/projects  body JSON (no @Valid — plain @RequestBody)
   ProjectResponse fields: id, resumeId, title, projectType,
     ndaRestricted, slug(auto), description, keyFeatures,
     roleInProject, clientName, industry, startDate(LocalDate),
     endDate(LocalDate nullable), projectStatus, technologiesUsed,
     toolsUsed, liveUrl, sourceCodeUrl, caseStudyUrl,
     featured, visibility(VisibilityType), displayOrder
════════════════════════════════════════════════════════════════ */

const PROJECT_STATUS = ["IN_PROGRESS","COMPLETED","ON_HOLD","PLANNED"].map((v)=>({value:v,label:v.replace(/_/g," ")}));
const VISIBILITY = [{value:"PUBLIC",label:"Public"},{value:"PRIVATE",label:"Private"}];

const PROJECT_TYPE_TO_ENUM = {
  "Personal": "PERSONAL",
  "Academic": "ACADEMIC",
  "Company": "COMPANY",
  "Freelance": "FREELANCE",
  "Open Source": "OPEN_SOURCE",
  "Research": "RESEARCH",
  "Other": "PERSONAL" // Fallback
};

const DEF_PROJ = {
  title:"", projectType:"Personal", ndaRestricted:false, description:"",
  keyFeatures:"", roleInProject:"", clientName:"", industry:"",
  startDate:"", endDate:"", projectStatus:"COMPLETED",
  technologiesUsed:"", toolsUsed:"", liveUrl:"", sourceCodeUrl:"",
  caseStudyUrl:"", featured:false, visibility:"PUBLIC",
};

export function ProjectsSection({ resumeId, onNotify }) {
  const [items, setItems]   = useState([]);
  const [editing, setEditing]= useState(null);
  const [form, setForm]     = useState({ ...DEF_PROJ });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting]= useState(null);
  const [loading, setLoading]= useState(true);
  const [error, setError]   = useState(null);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const load = () => {
    setLoading(true);
    import("../editorAPI").then(({ projectAPI }) =>
      projectAPI.getAll(resumeId).then((d) => setItems(Array.isArray(d)?d:[])).finally(()=>setLoading(false))
    );
  };

  useEffect(() => { load(); }, [resumeId]);

  const handleSave = async () => {
    setError(null); setSaving(true);
    try {
      const { projectAPI } = await import("../editorAPI");
      
      let enumProjectType = "PERSONAL";
      if (form.projectType) {
        if (form.projectType === form.projectType.toUpperCase()) {
            enumProjectType = form.projectType;
        } else {
            enumProjectType = PROJECT_TYPE_TO_ENUM[form.projectType] || "PERSONAL";
        }
      }

      const body = {
        ...form, resumeId,
        projectType: enumProjectType,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        keyFeatures: form.keyFeatures ? form.keyFeatures.split("\n").map(s=>s.trim()).filter(Boolean) : [],
        technologiesUsed: form.technologiesUsed ? form.technologiesUsed.split(",").map(s=>s.trim()).filter(Boolean) : [],
        toolsUsed: form.toolsUsed ? form.toolsUsed.split(",").map(s=>s.trim()).filter(Boolean) : [],
      };
      if (editing === "new") { await projectAPI.create(body); }
      else { await projectAPI.update(editing, body); }
      onNotify("Project saved ✓"); setEditing(null); load();
    } catch (e) { setError(e?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete project?")) return;
    setDeleting(id);
    try {
      const { projectAPI } = await import("../editorAPI");
      await projectAPI.delete(id); // returns ok() not noContent()
      setItems((p) => p.filter((x) => x.id !== id));
      onNotify("Deleted");
    } catch { onNotify("Delete failed", false); }
    finally { setDeleting(null); }
  };

  const startEdit = (item) => {
    setForm({
      title:item.title||"", projectType:item.projectType||"",
      ndaRestricted:item.ndaRestricted||false, description:item.description||"",
      keyFeatures:item.keyFeatures ? item.keyFeatures.join("\n") : "", 
      roleInProject:item.roleInProject||"",
      clientName:item.clientName||"", industry:item.industry||"",
      startDate:item.startDate?String(item.startDate):"",
      endDate:item.endDate?String(item.endDate):"",
      projectStatus:item.projectStatus||"COMPLETED",
      technologiesUsed:item.technologiesUsed ? item.technologiesUsed.join(", ") : "", 
      toolsUsed:item.toolsUsed ? item.toolsUsed.join(", ") : "",
      liveUrl:item.liveUrl||"", sourceCodeUrl:item.sourceCodeUrl||"",
      caseStudyUrl:item.caseStudyUrl||"", featured:item.featured||false,
      visibility:item.visibility||"PUBLIC",
    });
    setEditing(item.id); setError(null);
  };

  if (loading) return <SectionLoader/>;

  if (editing !== null) return (
    <div>
      <div style={formTitle}>{editing==="new"?"Add Project":"Edit Project"}</div>
      <ErrorBox msg={error}/>
      <FormGrid cols={2}>
        <Field label="Project Title" required><Input value={form.title} onChange={(v)=>set("title",v)} placeholder="My Awesome Project"/></Field>
        <Field label="Project Type">
            <Select value={form.projectType} onChange={(v)=>set("projectType",v)} options={Object.keys(PROJECT_TYPE_TO_ENUM).map((c) => ({ value: c, label: c }))} />
        </Field>
        <Field label="Industry"><Input value={form.industry} onChange={(v)=>set("industry",v)} placeholder="FinTech, Healthcare…"/></Field>
        <Field label="Client Name"><Input value={form.clientName} onChange={(v)=>set("clientName",v)} placeholder="Acme Corp"/></Field>
        <Field label="Start Date"><Input type="date" value={form.startDate} onChange={(v)=>set("startDate",v)}/></Field>
        <Field label="End Date" hint="Leave blank if ongoing"><Input type="date" value={form.endDate} onChange={(v)=>set("endDate",v)}/></Field>
        <Field label="Status"><Select value={form.projectStatus} onChange={(v)=>set("projectStatus",v)} options={PROJECT_STATUS}/></Field>
        <Field label="Visibility"><Select value={form.visibility} onChange={(v)=>set("visibility",v)} options={VISIBILITY}/></Field>
      </FormGrid>
      <Field label="Description"><Textarea value={form.description} onChange={(v)=>set("description",v)} placeholder="What is this project about?" rows={3}/></Field>
      <Field label="Key Features" hint="One per line"><Textarea value={form.keyFeatures} onChange={(v)=>set("keyFeatures",v)} rows={2}/></Field>
      <Field label="Your Role"><Input value={form.roleInProject} onChange={(v)=>set("roleInProject",v)} placeholder="Lead Developer, Designer…"/></Field>
      <FormGrid cols={2}>
        <Field label="Technologies Used" hint="Comma-separated"><Input value={form.technologiesUsed} onChange={(v)=>set("technologiesUsed",v)} placeholder="React, Node.js…"/></Field>
        <Field label="Tools Used"><Input value={form.toolsUsed} onChange={(v)=>set("toolsUsed",v)} placeholder="Figma, VS Code…"/></Field>
        <Field label="Live URL"><Input value={form.liveUrl} onChange={(v)=>set("liveUrl",v)} placeholder="https://"/></Field>
        <Field label="Source Code URL"><Input value={form.sourceCodeUrl} onChange={(v)=>set("sourceCodeUrl",v)} placeholder="https://github.com/…"/></Field>
      </FormGrid>
      <Field label="Case Study URL"><Input value={form.caseStudyUrl} onChange={(v)=>set("caseStudyUrl",v)} placeholder="https://"/></Field>
      <Toggle val={form.featured} onChange={(v)=>set("featured",v)} label="Featured project" sub="Shown prominently on public portfolio"/>
      <Toggle val={form.ndaRestricted} onChange={(v)=>set("ndaRestricted",v)} label="NDA Restricted" sub="Description hidden on public view"/>
      <FormActions onSave={handleSave} onCancel={()=>setEditing(null)} saving={saving}/>
    </div>
  );

  if (items.length===0) return <SectionEmpty emoji="🚀" title="No projects yet" subtitle="Showcase your best work — personal, professional, or freelance." onAdd={()=>{setForm({...DEF_PROJ});setEditing("new");}}/>;

  return (
    <div>
      {items.map((item) => (
        <ItemCard key={item.id} onEdit={()=>startEdit(item)} onDelete={()=>handleDelete(item.id)} deleting={deleting===item.id}>
          <div style={itemTitle}>{item.title}{item.featured&&<span style={featBadge}>⭐ Featured</span>}{item.ndaRestricted&&<span style={ndaBadge}>🔒 NDA</span>}</div>
          <div style={itemSub}>{item.projectType} · {item.projectStatus?.replace(/_/g," ")}</div>
          {item.technologiesUsed&&<div style={itemMeta}>🛠 {item.technologiesUsed}</div>}
        </ItemCard>
      ))}
      <AddBtn onClick={()=>{setForm({...DEF_PROJ});setEditing("new");}} label="Add Project"/>
    </div>
  );
}



/* ════════════════════════════════════════════════════════════════
   CERTIFICATIONS SECTION
   POST multipart: data + file(optional)
   Fields: title, certificateUrl (from file or stays null)
════════════════════════════════════════════════════════════════ */

export function CertificationsSection({ resumeId, onNotify }) {
  const [items, setItems]   = useState([]);
  const [editing, setEditing]= useState(null);
  const [form, setForm]     = useState({ title:"" });
  const [file, setFile]     = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting]= useState(null);
  const [loading, setLoading]= useState(true);
  const [error, setError]   = useState(null);

  const load = () => {
    setLoading(true);
    import("../editorAPI").then(({ certificationAPI }) =>
      certificationAPI.getAll(resumeId).then((d)=>setItems(Array.isArray(d)?d:[])).finally(()=>setLoading(false))
    );
  };

  useEffect(()=>{load();},[resumeId]);

  const handleSave = async () => {
    setError(null); setSaving(true);
    try {
      const { certificationAPI } = await import("../editorAPI");
      if (editing==="new") { await certificationAPI.create({ title:form.title, resumeId }, file); }
      else { await certificationAPI.update(editing, { title:form.title }, file); }
      onNotify("Certification saved ✓"); setEditing(null); setFile(null); load();
    } catch(e) { setError(e?.message||"Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    setDeleting(id);
    try {
      const { certificationAPI } = await import("../editorAPI");
      await certificationAPI.delete(id);
      setItems((p)=>p.filter((x)=>x.id!==id)); onNotify("Deleted");
    } catch { onNotify("Delete failed", false); }
    finally { setDeleting(null); }
  };

  if (loading) return <SectionLoader/>;

  if (editing!==null) return (
    <div>
      <div style={formTitle}>{editing==="new"?"Add Certification":"Edit Certification"}</div>
      <ErrorBox msg={error}/>
      <Field label="Certification Title" required><Input value={form.title} onChange={(v)=>setForm({title:v})} placeholder="AWS Solutions Architect"/></Field>
      <FileUpload label="Certificate File" accept="image/*,.pdf" onChange={setFile} hint="Upload image or PDF of the certificate (optional)"/>
      <FormActions onSave={handleSave} onCancel={()=>{setEditing(null);setFile(null);}} saving={saving}/>
    </div>
  );

  if (items.length===0) return <SectionEmpty emoji="🏆" title="No certifications yet" subtitle="Add your professional certifications and achievements." onAdd={()=>{setForm({title:""});setEditing("new");}}/>;

  return (
    <div>
      {items.map((item)=>(
        <ItemCard key={item.id} onEdit={()=>{setForm({title:item.title||""});setEditing(item.id);}} onDelete={()=>handleDelete(item.id)} deleting={deleting===item.id}>
          <div style={itemTitle}>{item.title}</div>
          {item.certificateUrl&&<a href={item.certificateUrl} target="_blank" rel="noreferrer" style={{fontSize:10.5,color:"#4A6FA5",fontFamily:"'DM Sans',sans-serif"}}>View Certificate →</a>}
        </ItemCard>
      ))}
      <AddBtn onClick={()=>{setForm({title:""});setEditing("new");}} label="Add Certification"/>
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════
   BLOGS SECTION
   POST multipart: data + coverFile (optional)
   visibility: "Draft" | "Public"  (STRING not enum!)
   NO reorder endpoint.
   BlogResponse: id, resumeId, title, slug, coverImage, content,
     tags, visibility, viewCount, publishedAt, createdAt, updatedAt
════════════════════════════════════════════════════════════════ */

const DEF_BLOG = { title:"", content:"", tags:"", visibility:"Draft" };

export function BlogsSection({ resumeId, onNotify }) {
  const [items, setItems]   = useState([]);
  const [editing, setEditing]= useState(null);
  const [form, setForm]     = useState({ ...DEF_BLOG });
  const [cover, setCover]   = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting]= useState(null);
  const [loading, setLoading]= useState(true);
  const [error, setError]   = useState(null);

  const set = (k,v) => setForm((p)=>({...p,[k]:v}));

  const load = () => {
    setLoading(true);
    import("../editorAPI").then(({blogAPI})=>
      blogAPI.getAll(resumeId).then((d)=>setItems(Array.isArray(d)?d:[])).finally(()=>setLoading(false))
    );
  };

  useEffect(()=>{load();},[resumeId]);

  const handleSave = async () => {
    setError(null); setSaving(true);
    try {
      const { blogAPI } = await import("../editorAPI");
      const body = {
        ...form,
        resumeId,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : []
      };
      if (editing==="new") { await blogAPI.create(body, cover); }
      else { await blogAPI.update(editing, body, cover); }
      onNotify("Blog post saved ✓"); setEditing(null); setCover(null); load();
    } catch(e) { setError(e?.message||"Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete post?")) return;
    setDeleting(id);
    try {
      const { blogAPI } = await import("../editorAPI");
      await blogAPI.delete(id);
      setItems((p)=>p.filter((x)=>x.id!==id)); onNotify("Deleted");
    } catch { onNotify("Delete failed", false); }
    finally { setDeleting(null); }
  };

  if (loading) return <SectionLoader/>;

  if (editing!==null) return (
    <div>
      <div style={formTitle}>{editing==="new"?"New Blog Post":"Edit Blog Post"}</div>
      <ErrorBox msg={error}/>
      <FormGrid cols={2}>
        <Field label="Title" required style={{gridColumn:"1/-1"}}><Input value={form.title} onChange={(v)=>set("title",v)} placeholder="My thoughts on design systems…"/></Field>
        <Field label="Visibility">
          <Select value={form.visibility} onChange={(v)=>set("visibility",v)} options={[{value:"Draft",label:"Draft"},{value:"Public",label:"Public"}]}/>
        </Field>
        <Field label="Tags" hint="Comma-separated"><Input value={form.tags} onChange={(v)=>set("tags",v)} placeholder="design, ux, tips"/></Field>
      </FormGrid>
      <Field label="Content"><Textarea value={form.content} onChange={(v)=>set("content",v)} placeholder="Write your blog post here…" rows={8}/></Field>
      <FileUpload label="Cover Image" accept="image/*" onChange={setCover} hint="Optional cover image for the blog post"/>
      <FormActions onSave={handleSave} onCancel={()=>{setEditing(null);setCover(null);}} saving={saving}/>
    </div>
  );

  if (items.length===0) return <SectionEmpty emoji="✍️" title="No blog posts yet" subtitle="Share your thoughts, case studies, and insights." onAdd={()=>{setForm({...DEF_BLOG});setEditing("new");}}/>;

  return (
    <div>
      {items.map((item)=>(
        <ItemCard key={item.id} onEdit={()=>{setForm({title:item.title||"",content:item.content||"",tags:item.tags?item.tags.join(", "):"",visibility:item.visibility||"Draft"});setEditing(item.id);}} onDelete={()=>handleDelete(item.id)} deleting={deleting===item.id}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
            <div style={itemTitle}>{item.title}</div>
            <span style={{fontSize:9.5,fontWeight:700,color:item.visibility==="Public"?"#22c55e":"#8A8578",background:item.visibility==="Public"?"rgba(34,197,94,0.1)":"rgba(138,133,120,0.1)",padding:"2px 7px",borderRadius:20,fontFamily:"'DM Sans',sans-serif"}}>{item.visibility}</span>
          </div>
          {item.tags&&<div style={itemMeta}>🏷 {Array.isArray(item.tags) ? item.tags.join(", ") : item.tags}</div>}
          {item.viewCount>0&&<div style={itemMeta}>👁 {item.viewCount} views</div>}
        </ItemCard>
      ))}
      <AddBtn onClick={()=>{setForm({...DEF_BLOG});setEditing("new");}} label="New Blog Post"/>
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════
   TESTIMONIALS SECTION
   verified=false always on create
   update allows setting verified=true (admin-like)
   public only shows verified=true records
   rating validation: 1-5 in update
════════════════════════════════════════════════════════════════ */

const DEF_TEST = { clientName:"", clientCompany:"", rating:5, dateGiven:"", testimonialText:"" };

export function TestimonialsSection({ resumeId, onNotify }) {
  const [items, setItems]   = useState([]);
  const [editing, setEditing]= useState(null);
  const [form, setForm]     = useState({ ...DEF_TEST });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting]= useState(null);
  const [loading, setLoading]= useState(true);
  const [error, setError]   = useState(null);

  const set = (k,v) => setForm((p)=>({...p,[k]:v}));

  const load = () => {
    setLoading(true);
    import("../editorAPI").then(({testimonialAPI})=>
      testimonialAPI.getAll(resumeId).then((d)=>setItems(Array.isArray(d)?d:[])).finally(()=>setLoading(false))
    );
  };

  useEffect(()=>{load();},[resumeId]);

  const handleSave = async () => {
    setError(null); setSaving(true);
    try {
      const { testimonialAPI } = await import("../editorAPI");
      const body = { ...form, resumeId, rating:Number(form.rating), dateGiven:form.dateGiven||null };
      if (editing==="new") { await testimonialAPI.create(body); }
      else { await testimonialAPI.update(editing, body); }
      onNotify("Testimonial saved ✓"); setEditing(null); load();
    } catch(e) { setError(e?.message||"Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete testimonial?")) return;
    setDeleting(id);
    try {
      const { testimonialAPI } = await import("../editorAPI");
      await testimonialAPI.delete(id);
      setItems((p)=>p.filter((x)=>x.id!==id)); onNotify("Deleted");
    } catch { onNotify("Delete failed", false); }
    finally { setDeleting(null); }
  };

  if (loading) return <SectionLoader/>;

  if (editing!==null) return (
    <div>
      <div style={formTitle}>{editing==="new"?"Add Testimonial":"Edit Testimonial"}</div>
      <div style={{padding:"9px 12px",borderRadius:9,background:"#FFF7ED",border:"1px solid #FED7AA",fontSize:11,color:"#92400E",marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}>
        💡 New testimonials start as unverified. You can mark them verified after confirming they're genuine.
      </div>
      <ErrorBox msg={error}/>
      <FormGrid cols={2}>
        <Field label="Client Name" required><Input value={form.clientName} onChange={(v)=>set("clientName",v)} placeholder="John Smith"/></Field>
        <Field label="Client Company"><Input value={form.clientCompany} onChange={(v)=>set("clientCompany",v)} placeholder="Acme Corp"/></Field>
        <Field label="Rating (1-5)" required><Input type="number" value={form.rating} onChange={(v)=>set("rating",Math.min(5,Math.max(1,Number(v))))} placeholder="5"/></Field>
        <Field label="Date Given"><Input type="date" value={form.dateGiven} onChange={(v)=>set("dateGiven",v)}/></Field>
      </FormGrid>
      <Field label="Testimonial Text" required><Textarea value={form.testimonialText} onChange={(v)=>set("testimonialText",v)} placeholder="Working with them was an incredible experience…" rows={4}/></Field>
      {editing!=="new"&&<Toggle val={form.verified||false} onChange={(v)=>set("verified",v)} label="Mark as Verified" sub="Verified testimonials show on your public portfolio"/>}
      <FormActions onSave={handleSave} onCancel={()=>setEditing(null)} saving={saving}/>
    </div>
  );

  if (items.length===0) return <SectionEmpty emoji="⭐" title="No testimonials yet" subtitle="Add client testimonials to build social proof." onAdd={()=>{setForm({...DEF_TEST});setEditing("new");}}/>;

  return (
    <div>
      {items.map((item)=>(
        <ItemCard key={item.id} onEdit={()=>{setForm({clientName:item.clientName||"",clientCompany:item.clientCompany||"",rating:item.rating||5,dateGiven:item.dateGiven?String(item.dateGiven):"",testimonialText:item.testimonialText||"",verified:item.verified||false});setEditing(item.id);}} onDelete={()=>handleDelete(item.id)} deleting={deleting===item.id}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
            <div style={itemTitle}>{item.clientName}</div>
            {item.verified?<span style={{fontSize:9,color:"#22c55e",background:"rgba(34,197,94,0.1)",padding:"1px 6px",borderRadius:20,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>✓ Verified</span>:<span style={{fontSize:9,color:"#8A8578",background:"rgba(138,133,120,0.1)",padding:"1px 6px",borderRadius:20,fontFamily:"'DM Sans',sans-serif"}}>Unverified</span>}
          </div>
          {item.clientCompany&&<div style={itemSub}>{item.clientCompany}</div>}
          <div style={itemMeta}>{"⭐".repeat(item.rating||0)}</div>
        </ItemCard>
      ))}
      <AddBtn onClick={()=>{setForm({...DEF_TEST});setEditing("new");}} label="Add Testimonial"/>
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════
   SERVICES SECTION — NO reorder endpoint!
   visibility defaults to PUBLIC in backend
════════════════════════════════════════════════════════════════ */

const PRICING_MODELS = ["FIXED","HOURLY","MONTHLY","PROJECT_BASED","NEGOTIABLE"].map((v)=>({value:v,label:v.replace(/_/g," ")}));
const CURRENCIES = ["INR","USD","EUR","GBP"].map((v)=>({value:v,label:v}));
const DURATIONS = ["1 hour","2 hours","1 day","3 days","1 week","2 weeks","1 month","3 months","6 months","Ongoing"].map((v)=>({value:v,label:v}));
const DEF_SVC = { serviceTitle:"", serviceCategory:"", description:"", pricingModel:"FIXED", basePrice:"", currency:"INR", duration:"1 week", deliverables:"", targetAudience:"", featured:false, visibility:"PUBLIC" };

export function ServicesSection({ resumeId, onNotify }) {
  const [items, setItems]   = useState([]);
  const [editing, setEditing]= useState(null);
  const [form, setForm]     = useState({ ...DEF_SVC });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting]= useState(null);
  const [loading, setLoading]= useState(true);
  const [error, setError]   = useState(null);

  const set = (k,v) => setForm((p)=>({...p,[k]:v}));

  const load = () => {
    setLoading(true);
    import("../editorAPI").then(({serviceAPI})=>
      serviceAPI.getAll(resumeId).then((d)=>setItems(Array.isArray(d)?d:[])).finally(()=>setLoading(false))
    );
  };

  useEffect(()=>{load();},[resumeId]);

  const handleSave = async () => {
    setError(null); setSaving(true);
    try {
      const { serviceAPI } = await import("../editorAPI");
      const body = { 
        ...form, 
        resumeId, 
        basePrice: form.basePrice ? Number(form.basePrice) : null,
        deliverables: form.deliverables ? form.deliverables.split("\n").map(s=>s.trim()).filter(Boolean) : []
      };
      if (editing==="new") { await serviceAPI.create(body); }
      else { await serviceAPI.update(editing, body); }
      onNotify("Service saved ✓"); setEditing(null); load();
    } catch(e) { setError(e?.message||"Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete service?")) return;
    setDeleting(id);
    try {
      const { serviceAPI } = await import("../editorAPI");
      await serviceAPI.delete(id);
      setItems((p)=>p.filter((x)=>x.id!==id)); onNotify("Deleted");
    } catch { onNotify("Delete failed",false); }
    finally { setDeleting(null); }
  };

  if (loading) return <SectionLoader/>;

  if (editing!==null) return (
    <div>
      <div style={formTitle}>{editing==="new"?"Add Service":"Edit Service"}</div>
      <ErrorBox msg={error}/>
      <FormGrid cols={2}>
        <Field label="Service Title" required><Input value={form.serviceTitle} onChange={(v)=>set("serviceTitle",v)} placeholder="UI/UX Design Consultation"/></Field>
        <Field label="Category"><Input value={form.serviceCategory} onChange={(v)=>set("serviceCategory",v)} placeholder="Design, Development…"/></Field>
        <Field label="Pricing Model"><Select value={form.pricingModel} onChange={(v)=>set("pricingModel",v)} options={PRICING_MODELS}/></Field>
        <Field label="Base Price"><Input type="number" value={form.basePrice} onChange={(v)=>set("basePrice",v)} placeholder="5000"/></Field>
        <Field label="Currency"><Select value={form.currency} onChange={(v)=>set("currency",v)} options={CURRENCIES}/></Field>
        <Field label="Duration"><Select value={form.duration} onChange={(v)=>set("duration",v)} options={DURATIONS}/></Field>
        <Field label="Visibility"><Select value={form.visibility} onChange={(v)=>set("visibility",v)} options={VISIBILITY}/></Field>
      </FormGrid>
      <Field label="Description"><Textarea value={form.description} onChange={(v)=>set("description",v)} rows={3}/></Field>
      <Field label="Deliverables" hint="What the client gets"><Textarea value={form.deliverables} onChange={(v)=>set("deliverables",v)} rows={2}/></Field>
      <Field label="Target Audience"><Input value={form.targetAudience} onChange={(v)=>set("targetAudience",v)} placeholder="Startups, SMBs…"/></Field>
      <Toggle val={form.featured} onChange={(v)=>set("featured",v)} label="Featured service"/>
      <FormActions onSave={handleSave} onCancel={()=>setEditing(null)} saving={saving}/>
    </div>
  );

  if (items.length===0) return <SectionEmpty emoji="🛠" title="No services listed" subtitle="Let potential clients know what services you offer." onAdd={()=>{setForm({...DEF_SVC});setEditing("new");}}/>;

  return (
    <div>
      {items.map((item)=>(
        <ItemCard key={item.id} onEdit={()=>{setForm({serviceTitle:item.serviceTitle||"",serviceCategory:item.serviceCategory||"",description:item.description||"",pricingModel:item.pricingModel||"FIXED",basePrice:item.basePrice||"",currency:item.currency||"INR",duration:item.duration||"1 week",deliverables:item.deliverables?item.deliverables.join("\n"):"",targetAudience:item.targetAudience||"",featured:item.featured||false,visibility:item.visibility||"PUBLIC"});setEditing(item.id);}} onDelete={()=>handleDelete(item.id)} deleting={deleting===item.id}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <div style={itemTitle}>{item.serviceTitle}</div>
            {item.featured&&<span style={featBadge}>⭐</span>}
          </div>
          <div style={itemSub}>{item.serviceCategory} · {item.pricingModel?.replace(/_/g," ")}</div>
          {item.basePrice&&<div style={itemMeta}>💰 {item.currency} {item.basePrice}</div>}
        </ItemCard>
      ))}
      <AddBtn onClick={()=>{setForm({...DEF_SVC});setEditing("new");}} label="Add Service"/>
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════
   EXHIBITIONS & AWARDS SECTION
   awardType: backend does AwardType.valueOf(request.getAwardType().toUpperCase())
   year: int (not future)
════════════════════════════════════════════════════════════════ */

const AWARD_TYPES = ["AWARD","EXHIBITION","RECOGNITION","ACHIEVEMENT"].map((v)=>({value:v,label:v}));
const DEF_EXH = { title:"", eventName:"", location:"", year:new Date().getFullYear(), description:"", awardType:"AWARD" };

export function ExhibitionsSection({ resumeId, onNotify }) {
  const [items, setItems]   = useState([]);
  const [editing, setEditing]= useState(null);
  const [form, setForm]     = useState({ ...DEF_EXH });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting]= useState(null);
  const [loading, setLoading]= useState(true);
  const [error, setError]   = useState(null);

  const set = (k,v) => setForm((p)=>({...p,[k]:v}));

  const load = () => {
    setLoading(true);
    import("../editorAPI").then(({exhibitionAPI})=>
      exhibitionAPI.getAll(resumeId).then((d)=>setItems(Array.isArray(d)?d:[])).finally(()=>setLoading(false))
    );
  };

  useEffect(()=>{load();},[resumeId]);

  const handleSave = async () => {
    setError(null); setSaving(true);
    try {
      const { exhibitionAPI } = await import("../editorAPI");
      const body = { ...form, resumeId, year:Number(form.year), awardType:form.awardType.toUpperCase() };
      if (editing==="new") { await exhibitionAPI.create(body); }
      else { await exhibitionAPI.update(editing, body); }
      onNotify("Saved ✓"); setEditing(null); load();
    } catch(e) { setError(e?.message||"Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    setDeleting(id);
    try {
      const { exhibitionAPI } = await import("../editorAPI");
      await exhibitionAPI.delete(id);
      setItems((p)=>p.filter((x)=>x.id!==id)); onNotify("Deleted");
    } catch { onNotify("Delete failed",false); }
    finally { setDeleting(null); }
  };

  if (loading) return <SectionLoader/>;

  if (editing!==null) return (
    <div>
      <div style={formTitle}>{editing==="new"?"Add Award/Exhibition":"Edit"}</div>
      <ErrorBox msg={error}/>
      <FormGrid cols={2}>
        <Field label="Title" required><Input value={form.title} onChange={(v)=>set("title",v)} placeholder="Best Design Award"/></Field>
        <Field label="Type"><Select value={form.awardType} onChange={(v)=>set("awardType",v)} options={AWARD_TYPES}/></Field>
        <Field label="Event Name"><Input value={form.eventName} onChange={(v)=>set("eventName",v)} placeholder="Cannes Lions 2023"/></Field>
        <Field label="Location"><Input value={form.location} onChange={(v)=>set("location",v)} placeholder="Paris, France"/></Field>
        <Field label="Year" required><Input type="number" value={form.year} onChange={(v)=>set("year",v)}/></Field>
        <Field label="Visibility"><Select value={form.visibility||"PUBLIC"} onChange={(v)=>set("visibility",v)} options={VISIBILITY}/></Field>
      </FormGrid>
      <Field label="Description"><Textarea value={form.description} onChange={(v)=>set("description",v)} rows={2}/></Field>
      <FormActions onSave={handleSave} onCancel={()=>setEditing(null)} saving={saving}/>
    </div>
  );

  if (items.length===0) return <SectionEmpty emoji="🏅" title="No awards yet" subtitle="Add exhibitions, awards, grants, and recognitions." onAdd={()=>{setForm({...DEF_EXH});setEditing("new");}}/>;

  return (
    <div>
      {items.map((item)=>(
        <ItemCard key={item.id} onEdit={()=>{setForm({title:item.title||"",eventName:item.eventName||"",location:item.location||"",year:item.year||new Date().getFullYear(),description:item.description||"",awardType:item.awardType||"AWARD"});setEditing(item.id);}} onDelete={()=>handleDelete(item.id)} deleting={deleting===item.id}>
          <div style={itemTitle}>{item.title}</div>
          <div style={itemSub}>{item.awardType} · {item.eventName} · {item.year}</div>
          {item.location&&<div style={itemMeta}>📍 {item.location}</div>}
        </ItemCard>
      ))}
      <AddBtn onClick={()=>{setForm({...DEF_EXH});setEditing("new");}} label="Add Award/Exhibition"/>
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════
   MEDIA APPEARANCES SECTION
════════════════════════════════════════════════════════════════ */

const DEF_MEDIA = { platformName:"", episodeTitle:"", url:"", description:"", appearanceDate:"" };

export function MediaSection({ resumeId, onNotify }) {
  const [items, setItems]   = useState([]);
  const [editing, setEditing]= useState(null);
  const [form, setForm]     = useState({ ...DEF_MEDIA });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting]= useState(null);
  const [loading, setLoading]= useState(true);
  const [error, setError]   = useState(null);

  const set = (k,v) => setForm((p)=>({...p,[k]:v}));

  const load = () => {
    setLoading(true);
    import("../editorAPI").then(({mediaAPI})=>
      mediaAPI.getAll(resumeId).then((d)=>setItems(Array.isArray(d)?d:[])).finally(()=>setLoading(false))
    );
  };

  useEffect(()=>{load();},[resumeId]);

  const handleSave = async () => {
    setError(null); setSaving(true);
    try {
      const { mediaAPI } = await import("../editorAPI");
      const body = { ...form, resumeId, appearanceDate:form.appearanceDate||null };
      if (editing==="new") { await mediaAPI.create(body); }
      else { await mediaAPI.update(editing, body); }
      onNotify("Saved ✓"); setEditing(null); load();
    } catch(e) { setError(e?.message||"Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    setDeleting(id);
    try {
      const { mediaAPI } = await import("../editorAPI");
      await mediaAPI.delete(id);
      setItems((p)=>p.filter((x)=>x.id!==id)); onNotify("Deleted");
    } catch { onNotify("Delete failed",false); }
    finally { setDeleting(null); }
  };

  if (loading) return <SectionLoader/>;

  if (editing!==null) return (
    <div>
      <div style={formTitle}>{editing==="new"?"Add Media Appearance":"Edit"}</div>
      <ErrorBox msg={error}/>
      <FormGrid cols={2}>
        <Field label="Platform/Show Name" required><Input value={form.platformName} onChange={(v)=>set("platformName",v)} placeholder="The Tim Ferriss Show"/></Field>
        <Field label="Episode Title"><Input value={form.episodeTitle} onChange={(v)=>set("episodeTitle",v)} placeholder="Design Thinking in 2024"/></Field>
        <Field label="URL"><Input value={form.url} onChange={(v)=>set("url",v)} placeholder="https://podcast.com/…"/></Field>
        <Field label="Appearance Date"><Input type="date" value={form.appearanceDate} onChange={(v)=>set("appearanceDate",v)}/></Field>
      </FormGrid>
      <Field label="Description"><Textarea value={form.description} onChange={(v)=>set("description",v)} rows={2}/></Field>
      <FormActions onSave={handleSave} onCancel={()=>setEditing(null)} saving={saving}/>
    </div>
  );

  if (items.length===0) return <SectionEmpty emoji="🎙️" title="No media appearances yet" subtitle="Add podcasts, interviews, articles, TV/radio appearances." onAdd={()=>{setForm({...DEF_MEDIA});setEditing("new");}}/>;

  return (
    <div>
      {items.map((item)=>(
        <ItemCard key={item.id} onEdit={()=>{setForm({platformName:item.platformName||"",episodeTitle:item.episodeTitle||"",url:item.url||"",description:item.description||"",appearanceDate:item.appearanceDate?String(item.appearanceDate):""});setEditing(item.id);}} onDelete={()=>handleDelete(item.id)} deleting={deleting===item.id}>
          <div style={itemTitle}>{item.episodeTitle||item.platformName}</div>
          <div style={itemSub}>{item.platformName}</div>
          {item.url&&<a href={item.url} target="_blank" rel="noreferrer" style={{fontSize:10.5,color:"#4A6FA5",fontFamily:"'DM Sans',sans-serif"}}>Listen/Watch →</a>}
        </ItemCard>
      ))}
      <AddBtn onClick={()=>{setForm({...DEF_MEDIA});setEditing("new");}} label="Add Media Appearance"/>
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════
   PUBLICATIONS SECTION
   reorder: POST /api/publications/reorder/{resumeId}  ← POST not PUT!
   delete: returns ok() not noContent()
════════════════════════════════════════════════════════════════ */

const DEF_PUB = { title:"", publisher:"", publicationDate:"", url:"", description:"", coAuthors:"" };

export function PublicationsSection({ resumeId, onNotify }) {
  const [items, setItems]   = useState([]);
  const [editing, setEditing]= useState(null);
  const [form, setForm]     = useState({ ...DEF_PUB });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting]= useState(null);
  const [loading, setLoading]= useState(true);
  const [error, setError]   = useState(null);

  const set = (k,v) => setForm((p)=>({...p,[k]:v}));

  const load = () => {
    setLoading(true);
    import("../editorAPI").then(({publicationAPI})=>
      publicationAPI.getAll(resumeId).then((d)=>setItems(Array.isArray(d)?d:[])).finally(()=>setLoading(false))
    );
  };

  useEffect(()=>{load();},[resumeId]);

  const handleSave = async () => {
    setError(null); setSaving(true);
    try {
      const { publicationAPI } = await import("../editorAPI");
      const body = { ...form, resumeId, publicationDate:form.publicationDate||null };
      if (editing==="new") { await publicationAPI.create(body); }
      else { await publicationAPI.update(editing, body); }
      onNotify("Publication saved ✓"); setEditing(null); load();
    } catch(e) { setError(e?.message||"Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    setDeleting(id);
    try {
      const { publicationAPI } = await import("../editorAPI");
      await publicationAPI.delete(id); // returns ok() not noContent()!
      setItems((p)=>p.filter((x)=>x.id!==id)); onNotify("Deleted");
    } catch { onNotify("Delete failed",false); }
    finally { setDeleting(null); }
  };

  if (loading) return <SectionLoader/>;

  if (editing!==null) return (
    <div>
      <div style={formTitle}>{editing==="new"?"Add Publication":"Edit Publication"}</div>
      <ErrorBox msg={error}/>
      <Field label="Title" required><Input value={form.title} onChange={(v)=>set("title",v)} placeholder="Design Systems at Scale"/></Field>
      <FormGrid cols={2}>
        <Field label="Publisher"><Input value={form.publisher} onChange={(v)=>set("publisher",v)} placeholder="O'Reilly, Medium, IEEE…"/></Field>
        <Field label="Publication Date"><Input type="date" value={form.publicationDate} onChange={(v)=>set("publicationDate",v)}/></Field>
        <Field label="URL"><Input value={form.url} onChange={(v)=>set("url",v)} placeholder="https://"/></Field>
        <Field label="Co-Authors" hint="Comma-separated"><Input value={form.coAuthors} onChange={(v)=>set("coAuthors",v)} placeholder="Jane Doe, Bob Smith"/></Field>
      </FormGrid>
      <Field label="Description"><Textarea value={form.description} onChange={(v)=>set("description",v)} rows={2}/></Field>
      <FormActions onSave={handleSave} onCancel={()=>setEditing(null)} saving={saving}/>
    </div>
  );

  if (items.length===0) return <SectionEmpty emoji="📚" title="No publications yet" subtitle="Add papers, articles, books, blog posts you've authored." onAdd={()=>{setForm({...DEF_PUB});setEditing("new");}}/>;

  return (
    <div>
      {items.map((item)=>(
        <ItemCard key={item.id} onEdit={()=>{setForm({title:item.title||"",publisher:item.publisher||"",publicationDate:item.publicationDate?String(item.publicationDate):"",url:item.url||"",description:item.description||"",coAuthors:item.coAuthors||""});setEditing(item.id);}} onDelete={()=>handleDelete(item.id)} deleting={deleting===item.id}>
          <div style={itemTitle}>{item.title}</div>
          {item.publisher&&<div style={itemSub}>{item.publisher} {item.publicationDate?`· ${item.publicationDate}`:""}</div>}
          {item.url&&<a href={item.url} target="_blank" rel="noreferrer" style={{fontSize:10.5,color:"#4A6FA5",fontFamily:"'DM Sans',sans-serif"}}>Read →</a>}
        </ItemCard>
      ))}
      <AddBtn onClick={()=>{setForm({...DEF_PUB});setEditing("new");}} label="Add Publication"/>
    </div>
  );
}


/* ════════════════════════════════════════════════════════════════
   FINANCIAL CREDENTIALS SECTION
   multipart: data + file(optional)
   credentialType: backend does .toUpperCase()
   status auto-calculated from validTill (ACTIVE/EXPIRED)
   public only shows ACTIVE records
════════════════════════════════════════════════════════════════ */

const CRED_TYPES = ["LICENSE","REGISTRATION","CERTIFICATION","MEMBERSHIP","COMPLIANCE"].map((v)=>({value:v,label:v.charAt(0) + v.slice(1).toLowerCase()}));
const DEF_FIN = { credentialType:"CERTIFICATION", certificationName:"", licenseNumber:"", issuingAuthority:"", issueDate:"", validTill:"", region:"", verificationUrl:"" };

export function FinancialSection({ resumeId, onNotify }) {
  const [items, setItems]   = useState([]);
  const [editing, setEditing]= useState(null);
  const [form, setForm]     = useState({ ...DEF_FIN });
  const [file, setFile]     = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting]= useState(null);
  const [loading, setLoading]= useState(true);
  const [error, setError]   = useState(null);

  const set = (k,v) => setForm((p)=>({...p,[k]:v}));

  const load = () => {
    setLoading(true);
    import("../editorAPI").then(({financialAPI})=>
      financialAPI.getAll(resumeId).then((d)=>setItems(Array.isArray(d)?d:[])).finally(()=>setLoading(false))
    );
  };

  useEffect(()=>{load();},[resumeId]);

  const handleSave = async () => {
    setError(null); setSaving(true);
    try {
      const { financialAPI } = await import("../editorAPI");
      const body = { ...form, resumeId, issueDate:form.issueDate||null, validTill:form.validTill||null };
      if (editing==="new") { await financialAPI.create(body, file); }
      else { await financialAPI.update(editing, body, file); }
      onNotify("Credential saved ✓"); setEditing(null); setFile(null); load();
    } catch(e) { setError(e?.message||"Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    setDeleting(id);
    try {
      const { financialAPI } = await import("../editorAPI");
      await financialAPI.delete(id);
      setItems((p)=>p.filter((x)=>x.id!==id)); onNotify("Deleted");
    } catch { onNotify("Delete failed",false); }
    finally { setDeleting(null); }
  };

  if (loading) return <SectionLoader/>;

  if (editing!==null) return (
    <div>
      <div style={formTitle}>{editing==="new"?"Add Financial Credential":"Edit Credential"}</div>
      <div style={{padding:"8px 12px",borderRadius:8,background:"#F0F9FF",border:"1px solid #BFDBFE",fontSize:11,color:"#1d4ed8",marginBottom:12,fontFamily:"'DM Sans',sans-serif"}}>
        💡 Status (ACTIVE/EXPIRED) is auto-calculated from Valid Till date.
      </div>
      <ErrorBox msg={error}/>
      <FormGrid cols={2}>
        <Field label="Credential Type" required><Select value={form.credentialType} onChange={(v)=>set("credentialType",v)} options={CRED_TYPES}/></Field>
        <Field label="Certification Name"><Input value={form.certificationName} onChange={(v)=>set("certificationName",v)} placeholder="Chartered Accountant"/></Field>
        <Field label="License Number"><Input value={form.licenseNumber} onChange={(v)=>set("licenseNumber",v)} placeholder="CA/2019/12345"/></Field>
        <Field label="Issuing Authority"><Input value={form.issuingAuthority} onChange={(v)=>set("issuingAuthority",v)} placeholder="ICAI"/></Field>
        <Field label="Issue Date"><Input type="date" value={form.issueDate} onChange={(v)=>set("issueDate",v)}/></Field>
        <Field label="Valid Till" hint="Leave blank = no expiry"><Input type="date" value={form.validTill} onChange={(v)=>set("validTill",v)}/></Field>
        <Field label="Region"><Input value={form.region} onChange={(v)=>set("region",v)} placeholder="India"/></Field>
        <Field label="Verification URL" hint="Or upload proof file below"><Input value={form.verificationUrl} onChange={(v)=>set("verificationUrl",v)} placeholder="https://"/></Field>
        <Field label="Visibility"><Select value={form.visibility||"PUBLIC"} onChange={(v)=>set("visibility",v)} options={VISIBILITY}/></Field>
      </FormGrid>
      <FileUpload label="Proof Document" accept="image/*,.pdf" onChange={setFile} hint="Upload license/certificate image or PDF"/>
      <FormActions onSave={handleSave} onCancel={()=>{setEditing(null);setFile(null);}} saving={saving}/>
    </div>
  );

  if (items.length===0) return <SectionEmpty emoji="📊" title="No financial credentials yet" subtitle="Add CA, CFA, CPA and other professional financial certifications." onAdd={()=>{setForm({...DEF_FIN});setEditing("new");}}/>;

  return (
    <div>
      {items.map((item)=>(
        <ItemCard key={item.id} onEdit={()=>{setForm({credentialType:item.credentialType||"CERTIFICATION",certificationName:item.certificationName||"",licenseNumber:item.licenseNumber||"",issuingAuthority:item.issuingAuthority||"",issueDate:item.issueDate?String(item.issueDate):"",validTill:item.validTill?String(item.validTill):"",region:item.region||"",verificationUrl:item.verificationUrl||"", visibility:item.visibility||"PUBLIC"});setEditing(item.id);}} onDelete={()=>handleDelete(item.id)} deleting={deleting===item.id}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
            <div style={itemTitle}>{item.certificationName||item.credentialType}</div>
            <span style={{fontSize:9.5,fontWeight:700,color:item.status==="ACTIVE"?"#22c55e":"#B43C3C",background:item.status==="ACTIVE"?"rgba(34,197,94,0.1)":"rgba(180,60,60,0.1)",padding:"1px 6px",borderRadius:20,fontFamily:"'DM Sans',sans-serif"}}>{item.status}</span>
          </div>
          <div style={itemSub}>{item.issuingAuthority} · #{item.licenseNumber}</div>
          {item.validTill&&<div style={itemMeta}>Valid till: {item.validTill}</div>}
        </ItemCard>
      ))}
      <AddBtn onClick={()=>{setForm({...DEF_FIN});setEditing("new");}} label="Add Financial Credential"/>
    </div>
  );
}

/* ── Shared micro-styles ────────────────────────────────────── */
const formTitle = { fontSize:13, fontWeight:700, color:"#1C1C1C", marginBottom:16, fontFamily:"'DM Sans',sans-serif" };
const itemTitle = { fontSize:13, fontWeight:700, color:"#1C1C1C", fontFamily:"'DM Sans',sans-serif" };
const itemSub   = { fontSize:11, color:"#5A5550", fontFamily:"'DM Sans',sans-serif", marginTop:2 };
const itemMeta  = { fontSize:10.5, color:"#8A8578", fontFamily:"'DM Sans',sans-serif", marginTop:3 };
const featBadge = { fontSize:9.5, color:"#C9963A", background:"rgba(201,150,58,0.1)", padding:"1px 6px", borderRadius:20, fontFamily:"'DM Sans',sans-serif", marginLeft:4 };
const ndaBadge  = { fontSize:9.5, color:"#5A5550", background:"rgba(90,85,80,0.1)", padding:"1px 6px", borderRadius:20, fontFamily:"'DM Sans',sans-serif", marginLeft:4 };

