import { useState, useEffect } from "react";
import axiosInstance from "../../../api/api";
import {
  Plus, Edit3, Trash2, Save, X,
  Loader2, CheckCircle, AlertCircle,
  GripVertical, Star, ChevronDown, ChevronUp
} from "lucide-react";

const EMPTY = {
  clientName:"",
  clientCompany:"",
  rating:5,
  dateGiven:"",
  testimonialText:"",
  verified:false
};

export default function TestimonialSection({ resumeId }) {

  const [list,setList] = useState([]);
  const [loading,setLoading] = useState(true);
  const [form,setForm] = useState(EMPTY);
  const [editId,setEditId] = useState(null);
  const [showForm,setShowForm] = useState(false);
  const [saving,setSaving] = useState(false);
  const [expanded,setExpanded] = useState(null);
  const [dragId,setDragId] = useState(null);
  const [reordering,setReordering] = useState(false);
  const [toast,setToast] = useState(null);

  const showToast = (msg,ok=true)=>{
    setToast({msg,ok});
    setTimeout(()=>setToast(null),3500);
  };

  const load = ()=>{
    axiosInstance.get(`/api/testimonials/resume/${resumeId}`)
      .then(r=>setList(r.data))
      .catch(()=>showToast("Failed to load testimonials",false))
      .finally(()=>setLoading(false));
  };

  useEffect(()=>{load()},[resumeId]);

  const openCreate = ()=>{
    setForm(EMPTY);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (t)=>{
    setForm({
      clientName:t.clientName ?? "",
      clientCompany:t.clientCompany ?? "",
      rating:t.rating ?? 5,
      dateGiven:t.dateGiven ?? "",
      testimonialText:t.testimonialText ?? "",
      verified:t.verified ?? false
    });

    setEditId(t.id);
    setShowForm(true);
    setExpanded(null);
  };

  const f=(k,v)=>setForm(p=>({...p,[k]:v}));

  const validate = ()=>{
    if(!form.clientName.trim()){
      showToast("Client name required",false);
      return false;
    }

    if(!form.testimonialText.trim()){
      showToast("Testimonial text required",false);
      return false;
    }

    return true;
  };

  const handleSave = ()=>{

    if(!validate()) return;

    setSaving(true);

    const payload = {
      resumeId,
      clientName:form.clientName.trim(),
      clientCompany:form.clientCompany || null,
      rating:Number(form.rating),
      dateGiven:form.dateGiven || null,
      testimonialText:form.testimonialText.trim(),
      verified:form.verified
    };

    const req = editId
      ? axiosInstance.put(`/api/testimonials/${editId}`,payload)
      : axiosInstance.post(`/api/testimonials`,payload);

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
    if(!window.confirm("Delete testimonial?")) return;

    axiosInstance.delete(`/api/testimonials/${id}`)
      .then(()=>{showToast("Deleted");load()})
      .catch(()=>showToast("Delete failed",false));
  };

  /* reorder */

  const onDrop = (targetId)=>{

    if(!dragId || dragId===targetId) return;

    const reordered=[...list];

    const from=reordered.findIndex(e=>e.id===dragId);
    const to=reordered.findIndex(e=>e.id===targetId);

    const [moved]=reordered.splice(from,1);
    reordered.splice(to,0,moved);

    setList(reordered);
    setDragId(null);

    setReordering(true);

    axiosInstance.put(
      `/api/testimonials/reorder/${resumeId}`,
      reordered.map(e=>e.id)
    )
      .catch(()=>{
        showToast("Reorder failed",false);
        load();
      })
      .finally(()=>setReordering(false));
  };

  return (
    <div style={s.wrap}>

      <div style={s.topRow}>
        <div>
          <h2 style={s.title}>Testimonials</h2>
          <p style={s.desc}>
            {list.length} testimonial{list.length!==1?"s":""} · drag to reorder
          </p>
        </div>

        <div style={{display:"flex",gap:8,alignItems:"center"}}>

          {reordering && (
            <Loader2 size={14} style={{animation:"spin .8s linear infinite"}}/>
          )}

          {!showForm && (
            <button style={s.btnPri} onClick={openCreate}>
              <Plus size={14}/> Add Testimonial
            </button>
          )}

        </div>
      </div>

      {toast && <Toast toast={toast}/>}

      {/* FORM */}

      {showForm && (

        <div style={s.card}>

          <div style={s.cardHead}>
            <span style={s.cardTitle}>
              {editId?"Edit Testimonial":"Add Testimonial"}
            </span>

            <button style={s.iconBtn} onClick={()=>setShowForm(false)}>
              <X size={15}/>
            </button>
          </div>

          <Field label="Client Name *">
            <input style={s.input}
              value={form.clientName}
              onChange={e=>f("clientName",e.target.value)}
            />
          </Field>

          <Field label="Company">
            <input style={s.input}
              value={form.clientCompany}
              onChange={e=>f("clientCompany",e.target.value)}
            />
          </Field>

          <Field label="Rating">
            <select style={s.input}
              value={form.rating}
              onChange={e=>f("rating",e.target.value)}
            >
              {[1,2,3,4,5].map(n=>(
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </Field>

          <Field label="Date Given">
            <input
              style={s.input}
              type="date"
              value={form.dateGiven}
              onChange={e=>f("dateGiven",e.target.value)}
            />
          </Field>

          <Field label="Testimonial *">
            <textarea
              style={{...s.input,resize:"vertical"}}
              rows={4}
              value={form.testimonialText}
              onChange={e=>f("testimonialText",e.target.value)}
            />
          </Field>

          <label style={{fontSize:13}}>
            <input type="checkbox"
              checked={form.verified}
              onChange={e=>f("verified",e.target.checked)}
            /> Verified
          </label>

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

            <div key={item.id}
              draggable
              onDragStart={()=>setDragId(item.id)}
              onDragOver={e=>e.preventDefault()}
              onDrop={()=>onDrop(item.id)}
              style={{...s.row}}
            >

              <GripVertical size={15} style={{color:"#D8D3CA"}}/>

              <div style={{flex:1}}>

                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <p style={s.rowTitle}>{item.clientName}</p>

                  {item.verified && (
                    <span style={s.verifiedBadge}>
                      <CheckCircle size={10}/> Verified
                    </span>
                  )}

                </div>

                <p style={s.rowSub}>
                  {item.clientCompany}

                  {item.rating && (
                    <>
                      <span style={s.dot}>·</span>
                      {[...Array(item.rating)].map((_,i)=>(
                        <Star key={i} size={12}/>
                      ))}
                    </>
                  )}

                </p>

                {expanded===item.id && (
                  <p style={{fontSize:12,marginTop:8}}>
                    {item.testimonialText}
                  </p>
                )}

              </div>

              <div style={{display:"flex",gap:6}}>

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

/* helpers */

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

const s={
  wrap:{fontFamily:"DM Sans"},
  topRow:{display:"flex",justifyContent:"space-between",marginBottom:20},
  title:{fontSize:22},
  desc:{fontSize:12,color:"#8A8578"},
  card:{background:"#ECEAE2",border:"1px solid #D8D3CA",borderRadius:14,padding:20,marginBottom:16},
  cardHead:{display:"flex",justifyContent:"space-between",marginBottom:16},
  cardTitle:{fontSize:16,fontWeight:500},
  row:{display:"flex",gap:12,alignItems:"flex-start",padding:14,border:"1px solid #D8D3CA",borderRadius:12,background:"#ECEAE2"},
  rowTitle:{margin:0,fontWeight:500},
  rowSub:{fontSize:11,color:"#8A8578",marginTop:2},
  dot:{margin:"0 6px"},
  iconBtn:{display:"flex",alignItems:"center",justifyContent:"center",width:32,height:32,borderRadius:8,border:"1px solid #D8D3CA",background:"#F0EDE6",cursor:"pointer"},
  verifiedBadge:{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,padding:"2px 8px",borderRadius:20,background:"rgba(58,125,68,.1)",color:"#3A7D44"},
  lbl:{fontSize:11,fontWeight:600,color:"#8A8578"},
  input:{width:"100%",padding:"10px 12px",borderRadius:9,border:"1px solid #D8D3CA",background:"#F0EDE6"},
  btnPri:{display:"inline-flex",alignItems:"center",gap:6,background:"#1C1C1C",color:"#fff",border:"none",padding:"10px 18px",borderRadius:9,cursor:"pointer"},
  btnSec:{background:"#E0DCD3",border:"none",padding:"10px 18px",borderRadius:9,cursor:"pointer"}
};