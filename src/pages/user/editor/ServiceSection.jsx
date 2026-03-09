import { useState, useEffect } from "react";
import axiosInstance from "../../../api/api";
import {
  Plus, Edit3, Trash2, Save, X,
  Loader2, CheckCircle, AlertCircle,
  Briefcase, ChevronDown, ChevronUp,
  Star, Eye, EyeOff, DollarSign
} from "lucide-react";

const EMPTY = {
  serviceTitle:"",
  serviceCategory:"",
  description:"",
  pricingModel:"",
  basePrice:"",
  currency:"USD",
  duration:"",
  deliverables:"",
  targetAudience:"",
  featured:false,
  visibility:"PUBLIC"
};

export default function ServiceSection({ resumeId }) {

  const [list,setList] = useState([]);
  const [loading,setLoading] = useState(true);
  const [form,setForm] = useState(EMPTY);
  const [editId,setEditId] = useState(null);
  const [showForm,setShowForm] = useState(false);
  const [saving,setSaving] = useState(false);
  const [expanded,setExpanded] = useState(null);
  const [toast,setToast] = useState(null);

  const showToast = (msg, ok=true)=>{
    setToast({msg,ok});
    setTimeout(()=>setToast(null),3500);
  };

  const load = ()=> {
    axiosInstance.get(`/api/services/resume/${resumeId}`)
      .then(r=>setList(r.data))
      .catch(()=>showToast("Failed to load services",false))
      .finally(()=>setLoading(false));
  };

  useEffect(()=>{load()},[resumeId]);

  const openCreate = ()=>{
    setForm(EMPTY);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (s)=>{
    setForm({
      serviceTitle:s.serviceTitle ?? "",
      serviceCategory:s.serviceCategory ?? "",
      description:s.description ?? "",
      pricingModel:s.pricingModel ?? "",
      basePrice:s.basePrice ?? "",
      currency:s.currency ?? "USD",
      duration:s.duration ?? "",
      deliverables:Array.isArray(s.deliverables)
        ? s.deliverables.join(", ")
        : "",
      targetAudience:s.targetAudience ?? "",
      featured:s.featured ?? false,
      visibility:s.visibility ?? "PUBLIC"
    });
    setEditId(s.id);
    setShowForm(true);
    setExpanded(null);
  };

  const f = (k,v)=>setForm(p=>({...p,[k]:v}));

  const validate = ()=>{
    if(!form.serviceTitle.trim()){
      showToast("Service title required",false);
      return false;
    }
    return true;
  };

  const handleSave = ()=>{

    if(!validate()) return;

    setSaving(true);

    const payload = {
      resumeId,
      serviceTitle:form.serviceTitle.trim(),
      serviceCategory:form.serviceCategory.trim() || null,
      description:form.description.trim() || null,
      pricingModel:form.pricingModel || null,
      basePrice:form.basePrice ? Number(form.basePrice) : null,
      currency:form.currency || "USD",
      duration:form.duration || null,
      deliverables:form.deliverables
        ? form.deliverables.split(",").map(d=>d.trim()).filter(Boolean)
        : [],
      targetAudience:form.targetAudience || null,
      featured:form.featured,
      visibility:form.visibility
    };

    const req = editId
      ? axiosInstance.put(`/api/services/${editId}`,payload)
      : axiosInstance.post(`/api/services`,payload);

    req
      .then(()=>{
        showToast(editId?"Updated":"Added");
        setShowForm(false);
        load();
      })
      .catch(()=>showToast("Save failed",false))
      .finally(()=>setSaving(false));
  };

  const handleDelete = (id)=>{
    if(!window.confirm("Delete service?")) return;

    axiosInstance.delete(`/api/services/${id}`)
      .then(()=>{showToast("Deleted");load()})
      .catch(()=>showToast("Delete failed",false));
  };

  const toggleVisibility = (item)=>{
    axiosInstance.put(`/api/services/${item.id}`,{
      visibility:item.visibility==="PUBLIC"?"PRIVATE":"PUBLIC"
    })
      .then(load);
  };

  return (
    <div style={s.wrap}>

      <div style={s.topRow}>
        <div>
          <h2 style={s.title}>Services</h2>
          <p style={s.desc}>{list.length} service{list.length!==1?"s":""}</p>
        </div>

        {!showForm && (
          <button style={s.btnPri} onClick={openCreate}>
            <Plus size={14}/> Add Service
          </button>
        )}
      </div>

      {toast && <Toast toast={toast}/>}

      {/* FORM */}

      {showForm && (
        <div style={s.card}>

          <div style={s.cardHead}>
            <span style={s.cardTitle}>
              {editId?"Edit Service":"Add Service"}
            </span>
            <button style={s.iconBtn} onClick={()=>setShowForm(false)}>
              <X size={15}/>
            </button>
          </div>

          <Field label="Service Title *">
            <input style={s.input}
              value={form.serviceTitle}
              onChange={e=>f("serviceTitle",e.target.value)}
            />
          </Field>

          <Field label="Category">
            <input style={s.input}
              value={form.serviceCategory}
              onChange={e=>f("serviceCategory",e.target.value)}
            />
          </Field>

          <Field label="Description">
            <textarea style={{...s.input,resize:"vertical"}}
              rows={4}
              value={form.description}
              onChange={e=>f("description",e.target.value)}
            />
          </Field>

          <div style={s.grid2}>
            <Field label="Pricing Model">
              <input style={s.input}
                value={form.pricingModel}
                onChange={e=>f("pricingModel",e.target.value)}
              />
            </Field>

            <Field label="Base Price">
              <input style={s.input}
                value={form.basePrice}
                onChange={e=>f("basePrice",e.target.value)}
              />
            </Field>
          </div>

          <Field label="Deliverables">
            <input style={s.input}
              value={form.deliverables}
              placeholder="landing page, consultation"
              onChange={e=>f("deliverables",e.target.value)}
            />
          </Field>

          <Field label="Target Audience">
            <input style={s.input}
              value={form.targetAudience}
              onChange={e=>f("targetAudience",e.target.value)}
            />
          </Field>

          <div style={{display:"flex",gap:12}}>

            <label style={{fontSize:13}}>
              <input type="checkbox"
                checked={form.featured}
                onChange={e=>f("featured",e.target.checked)}
              /> Featured
            </label>

            <select
              value={form.visibility}
              onChange={e=>f("visibility",e.target.value)}
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>

          </div>

          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:12}}>
            <button style={s.btnSec} onClick={()=>setShowForm(false)}>Cancel</button>
            <button style={s.btnPri} onClick={handleSave} disabled={saving}>
              {saving
                ? <Loader2 size={13} style={{animation:"spin .8s linear infinite"}}/>
                : <Save size={13}/>
              }
              {saving?"Saving":"Save"}
            </button>
          </div>

        </div>
      )}

      {/* LIST */}

      {loading ? <CenterLoader/> : (

        <div style={{display:"flex",flexDirection:"column",gap:8}}>

          {list.map(item => (

            <div key={item.id} style={s.row}>

              <div style={s.rowIcon}>
                <Briefcase size={17}/>
              </div>

              <div style={{flex:1}}>

                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <p style={s.rowTitle}>{item.serviceTitle}</p>

                  {item.featured && (
                    <span style={s.featuredBadge}>
                      <Star size={10}/> Featured
                    </span>
                  )}

                </div>

                <p style={s.rowSub}>
                  {item.serviceCategory}
                  {item.basePrice && (
                    <>
                    <span style={s.dot}>·</span>
                    <DollarSign size={11}/>
                    {item.basePrice} {item.currency}
                    </>
                  )}
                </p>

                {expanded===item.id && item.description && (
                  <p style={{fontSize:12,marginTop:8}}>
                    {item.description}
                  </p>
                )}

              </div>

              <div style={{display:"flex",gap:6}}>

                <button style={s.iconBtn}
                  onClick={()=>toggleVisibility(item)}
                >
                  {item.visibility==="PUBLIC"
                    ? <EyeOff size={13}/>
                    : <Eye size={13}/>
                  }
                </button>

                <button style={s.iconBtn}
                  onClick={()=>setExpanded(p=>p===item.id?null:item.id)}
                >
                  {expanded===item.id
                    ? <ChevronUp size={13}/>
                    : <ChevronDown size={13}/>
                  }
                </button>

                <button style={s.iconBtn}
                  onClick={()=>openEdit(item)}
                >
                  <Edit3 size={13}/>
                </button>

                <button style={{...s.iconBtn,color:"#B43C3C"}}
                  onClick={()=>handleDelete(item.id)}
                >
                  <Trash2 size={13}/>
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

    </div>
  );
}

/* helper components */

const Field = ({label,children})=>(
  <div style={{marginBottom:16}}>
    <label style={s.lbl}>{label}</label>
    {children}
  </div>
);

const Toast = ({toast})=>(
  <div style={{
    padding:"10px 14px",
    borderRadius:10,
    marginBottom:14,
    background:toast.ok?"rgba(58,125,68,.1)":"rgba(180,60,60,.1)",
    color:toast.ok?"#3A7D44":"#B43C3C"
  }}>
    {toast.msg}
  </div>
);

const CenterLoader = ()=>(
  <div style={{display:"flex",justifyContent:"center",padding:"40px"}}>
    <Loader2 size={24} style={{animation:"spin .8s linear infinite"}}/>
  </div>
);

/* styles */

const s = {
  wrap:{fontFamily:"DM Sans"},
  topRow:{display:"flex",justifyContent:"space-between",marginBottom:20},
  title:{fontSize:22},
  desc:{fontSize:12,color:"#8A8578"},
  card:{background:"#ECEAE2",border:"1px solid #D8D3CA",borderRadius:14,padding:20,marginBottom:16},
  cardHead:{display:"flex",justifyContent:"space-between",marginBottom:16},
  cardTitle:{fontSize:16,fontWeight:500},
  grid2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16},
  row:{display:"flex",gap:12,alignItems:"flex-start",padding:14,border:"1px solid #D8D3CA",borderRadius:12,background:"#ECEAE2"},
  rowIcon:{width:36,height:36,borderRadius:8,background:"rgba(28,28,28,.06)",display:"flex",alignItems:"center",justifyContent:"center"},
  rowTitle:{margin:0,fontWeight:500},
  rowSub:{fontSize:11,color:"#8A8578",marginTop:2},
  dot:{margin:"0 6px"},
  iconBtn:{display:"flex",alignItems:"center",justifyContent:"center",width:32,height:32,borderRadius:8,border:"1px solid #D8D3CA",background:"#F0EDE6",cursor:"pointer"},
  featuredBadge:{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,padding:"2px 8px",borderRadius:20,background:"rgba(201,150,58,.12)",color:"#C9963A"},
  lbl:{fontSize:11,fontWeight:600,color:"#8A8578"},
  input:{width:"100%",padding:"10px 12px",borderRadius:9,border:"1px solid #D8D3CA",background:"#F0EDE6"},
  btnPri:{display:"inline-flex",alignItems:"center",gap:6,background:"#1C1C1C",color:"#fff",border:"none",padding:"10px 18px",borderRadius:9,cursor:"pointer"},
  btnSec:{background:"#E0DCD3",border:"none",padding:"10px 18px",borderRadius:9,cursor:"pointer"}
};