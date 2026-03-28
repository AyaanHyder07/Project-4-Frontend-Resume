import React, { useMemo, useState } from 'react';
import { contactAPI } from '../../api/api';
import { formatDateRange } from '../utils/templateHelpers';
import { getOrderedSectionEntries, getSectionTitle, getContactDetails, getDensityStyles, getTemplateOption } from './templateData';

function cardStyle(variant, portfolio) {
  const density = getDensityStyles(portfolio);
  const cardMode = getTemplateOption(portfolio, 'cardStyle', 'soft');
  const baseRadius = cardMode === 'outlined' ? 18 : cardMode === 'glass' ? 26 : 24;
  const variants = {
    warm: { background: cardMode === 'solid' ? 'rgba(255,247,237,0.96)' : 'rgba(255,250,243,0.88)', border: cardMode === 'outlined' ? '1.5px solid rgba(28,25,23,0.14)' : '1px solid rgba(28,25,23,0.08)', borderRadius: baseRadius, padding: density.cardPadding, boxShadow: cardMode === 'glass' ? '0 18px 40px rgba(28,25,23,0.08)' : 'none' },
    dark: { background: cardMode === 'glass' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)', border: cardMode === 'outlined' ? '1.5px solid rgba(255,255,255,0.16)' : '1px solid rgba(255,255,255,0.08)', borderRadius: baseRadius, padding: density.cardPadding },
    soft: { background: cardMode === 'solid' ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.84)', border: cardMode === 'outlined' ? '1.5px solid rgba(28,25,23,0.14)' : '1px solid rgba(28,25,23,0.08)', borderRadius: baseRadius, padding: density.cardPadding, boxShadow: cardMode === 'glass' ? '0 18px 40px rgba(28,25,23,0.08)' : 'none' },
    panel: { background: cardMode === 'glass' ? 'rgba(17,17,17,0.78)' : 'rgba(17,17,17,0.86)', border: cardMode === 'outlined' ? '1.5px solid rgba(255,255,255,0.14)' : '1px solid rgba(255,255,255,0.08)', borderRadius: baseRadius, padding: density.cardPadding },
  };
  return variants[variant] || variants.soft;
}

function inputStyle(themeMode) {
  const dark = themeMode === 'dark' || themeMode === 'panel';
  return {
    width: '100%',
    borderRadius: 16,
    border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(28,25,23,0.12)',
    background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.92)',
    color: 'var(--color-text)',
    padding: '13px 14px',
    font: 'inherit',
    boxSizing: 'border-box',
  };
}

const buttonStyle = {
  border: 'none',
  borderRadius: 999,
  padding: '12px 18px',
  background: 'var(--color-accent)',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
};

function ContactForm({ portfolio, section, themeMode }) {
  const [status, setStatus] = useState(null);
  const style = cardStyle(themeMode, portfolio);
  const contacts = getContactDetails(portfolio?.profile, section);

  const onSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await contactAPI.submit({
        resumeId: section?.resumeId || portfolio?.resumeId,
        senderName: form.get('senderName'),
        senderEmail: form.get('senderEmail'),
        senderPhone: form.get('senderPhone'),
        subject: form.get('subject'),
        message: form.get('message'),
      });
      event.currentTarget.reset();
      setStatus({ type: 'success', text: 'Message sent successfully.' });
    } catch (error) {
      setStatus({ type: 'error', text: error?.response?.data?.message || 'Could not send message.' });
    }
  };

  return (
    <div style={{ ...style, display: 'grid', gap: 16 }}>
      {contacts.length ? (
        <div style={{ display: 'grid', gap: 8 }}>
          {contacts.map((item) => {
            const value = String(item);
            const href = value.includes('@') ? `mailto:${value}` : value.startsWith('http') ? value : null;
            return href ? <a key={value} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 700, overflowWrap: 'anywhere' }}>{value}</a> : <div key={value} style={{ overflowWrap: 'anywhere' }}>{value}</div>;
          })}
        </div>
      ) : null}
      {section?.showContactForm ? (
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <input name="senderName" placeholder="Your name" required style={inputStyle(themeMode)} />
          <input name="senderEmail" type="email" placeholder="Your email" required style={inputStyle(themeMode)} />
          <input name="senderPhone" placeholder="Phone number" style={inputStyle(themeMode)} />
          <input name="subject" placeholder="Subject" required style={inputStyle(themeMode)} />
          <textarea name="message" rows="5" placeholder="Tell me about your project" required style={inputStyle(themeMode)} />
          <button type="submit" style={buttonStyle}>Send message</button>
          {status ? <div style={{ fontSize: 13, color: status.type === 'success' ? 'var(--color-accent)' : '#d35d5d' }}>{status.text}</div> : null}
        </form>
      ) : null}
    </div>
  );
}

function renderItems(key, items, themeMode, portfolio) {
  const style = cardStyle(themeMode, portfolio);

  if (key === 'skills') {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {items.map((item, index) => (
          <span key={item.id || index} style={{ padding: '9px 12px', borderRadius: 999, border: '1px solid rgba(127,127,127,0.16)', background: 'rgba(255,255,255,0.06)', fontSize: 14 }}>
            {item.skillName || item.name || item.title}
          </span>
        ))}
      </div>
    );
  }

  if (key === 'testimonials') {
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        {items.map((item, index) => (
          <article key={item.id || index} style={style}>
            <p style={{ margin: 0, lineHeight: 1.8 }}>{item.testimonialText || item.quote || item.feedback}</p>
            <div style={{ marginTop: 12, fontWeight: 700 }}>{item.clientName || item.authorName || item.name || 'Client'}</div>
            <div style={{ opacity: 0.7, fontSize: 14 }}>{item.clientRole || item.role || item.company}</div>
          </article>
        ))}
      </div>
    );
  }

  if (key === 'services') {
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        {items.map((item, index) => (
          <article key={item.id || index} style={style}>
            <div style={{ display: 'grid', gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 22, lineHeight: 1.1 }}>{item.serviceTitle || item.title || 'Service'}</h3>
              <div style={{ opacity: 0.72, fontSize: 14 }}>{[item.serviceCategory, item.pricingModel, item.currency && item.basePrice ? `${item.currency} ${item.basePrice}` : null].filter(Boolean).join(' · ')}</div>
              {item.description ? <p style={{ margin: 0, lineHeight: 1.75, opacity: 0.86 }}>{item.description}</p> : null}
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (key === 'contact') return null;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {items.map((item, index) => {
        const title = item.title || item.roleTitle || item.degree || item.name || item.publicationName || item.organizationName || item.institutionName || item.credentialName || item.mediaTitle || item.awardTitle || item.clientName;
        const subtitle = item.organizationName || item.institutionName || item.publisher || item.issuer || item.company || item.platform || item.clientRole || item.location;
        const description = item.description || item.roleDescription || item.excerpt || item.summary || item.testimonialText || item.notes || item.result;
        const meta = formatDateRange(item.startDate, item.endDate, item.currentlyWorking) || item.issueDate || item.publishDate || item.year || item.date;
        const chips = item.techStack || item.tags || item.skills || item.topics || [];
        return (
          <article key={item.id || index} style={style}>
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 22, lineHeight: 1.1 }}>{title || 'Untitled'}</h3>
                  {subtitle ? <div style={{ marginTop: 5, opacity: 0.72, fontSize: 14 }}>{subtitle}</div> : null}
                </div>
                {meta ? <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.66 }}>{meta}</div> : null}
              </div>
              {description ? <p style={{ margin: 0, lineHeight: 1.75, opacity: 0.86 }}>{description}</p> : null}
              {Array.isArray(chips) && chips.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {chips.map((chip, chipIndex) => <span key={`${chip}-${chipIndex}`} style={{ padding: '7px 10px', borderRadius: 999, background: 'rgba(127,127,127,0.12)', fontSize: 12 }}>{chip}</span>)}
                </div>
              ) : null}
              {item.projectUrl || item.url || item.link ? <a href={item.projectUrl || item.url || item.link} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)', fontWeight: 700, textDecoration: 'none' }}>View more</a> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function renderCustomBlock(block, portfolio, variant) {
  const style = cardStyle(variant, portfolio);
  const payload = block?.payload || {};
  const title = block?.title || String(block?.blockType || 'Custom Block').replace(/_/g, ' ');
  const text = payload.text || payload.description || payload.summary || payload.body || '';
  const items = Array.isArray(payload.items) ? payload.items : [];
  const links = Array.isArray(payload.links) ? payload.links : [];

  return (
    <article key={block.id} data-custom-block-id={block.id} style={style}>
      <div style={{ display: 'grid', gap: 10 }}>
        <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.68 }}>{String(block.blockType || 'CUSTOM').replace(/_/g, ' ')}</div>
        <h3 style={{ margin: 0, fontSize: 22, lineHeight: 1.1 }}>{title}</h3>
        {text ? <p style={{ margin: 0, lineHeight: 1.75, opacity: 0.86 }}>{text}</p> : null}
        {items.length ? (
          <div style={{ display: 'grid', gap: 8 }}>
            {items.map((item, index) => <div key={`${block.id}-item-${index}`}>{typeof item === 'string' ? item : JSON.stringify(item)}</div>)}
          </div>
        ) : null}
        {links.length ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {links.map((item, index) => {
              const href = item?.url || item?.href || item;
              const label = item?.label || item?.title || href;
              return <a key={`${block.id}-link-${index}`} href={href} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 700 }}>{label}</a>;
            })}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function UniversalSectionStack({ portfolio, variant = 'soft', titleStyle, sectionGap }) {
  const sectionEntries = useMemo(() => getOrderedSectionEntries(portfolio), [portfolio]);
  const density = getDensityStyles(portfolio);
  const customBlocks = Array.isArray(portfolio?.customBlocks) ? portfolio.customBlocks.filter((block) => block?.enabled !== false) : [];

  return (
    <div style={{ display: 'grid', gap: sectionGap ?? density.sectionGap }}>
      {sectionEntries.map(([key, value]) => (
        <section key={key} id={key} data-customize-region="section" data-region-key={key} style={{ display: 'grid', gap: 16 }}>
          <div style={titleStyle || { fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-accent)', fontWeight: 700 }}>
            {getSectionTitle(portfolio, key)}
          </div>
          {key === 'contact' ? <ContactForm portfolio={portfolio} section={value} themeMode={variant} /> : renderItems(key, value, variant, portfolio)}
        </section>
      ))}

      {customBlocks.length ? (
        <section id="custom-blocks" data-customize-region="section" data-region-key="custom-blocks" style={{ display: 'grid', gap: 16 }}>
          <div style={titleStyle || { fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-accent)', fontWeight: 700 }}>
            Custom Blocks
          </div>
          <div style={{ display: 'grid', gap: 16 }}>
            {customBlocks.map((block) => renderCustomBlock(block, portfolio, variant))}
          </div>
        </section>
      ) : null}
    </div>
  );
}