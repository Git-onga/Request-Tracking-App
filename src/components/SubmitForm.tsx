import { useState } from 'react';
import type { FormValues, FormErrors, Submission, SubmissionType, Priority } from '../types';
import { uid } from '../utils';

const EMPTY_FORM: FormValues = {
  name: '', email: '', type: '', priority: 'medium', message: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim())        errors.name    = 'Name is required.';
  if (!values.email.trim())       errors.email   = 'Email is required.';
  else if (!EMAIL_RE.test(values.email.trim()))
                                   errors.email   = 'Enter a valid email address.';
  if (!values.type)               errors.type    = 'Please choose a request type.';
  if (!values.message.trim())     errors.message = 'Message is required.';
  return errors;
}

interface SubmitFormProps {
  onSubmit: (sub: Submission) => void;
}

export function SubmitForm({ onSubmit }: SubmitFormProps) {
  const [values, setValues]   = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors]   = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});

  function handleChange<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error as user types
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  function handleBlur(field: keyof FormValues) {
    setTouched(prev => ({ ...prev, [field]: true }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(values);
    if (Object.keys(errs).length) {
      setErrors(errs);
      // Mark all fields touched so errors appear
      setTouched({ name: true, email: true, type: true, message: true });
      return;
    }

    const sub: Submission = {
      id:          uid(),
      name:        values.name.trim(),
      email:       values.email.trim(),
      type:        values.type as SubmissionType,
      priority:    values.priority,
      message:     values.message.trim(),
      status:      'new',
      createdAt:   new Date().toISOString(),
    };

    onSubmit(sub);
    setValues(EMPTY_FORM);
    setErrors({});
    setTouched({});
  }

  function handleClear() {
    setValues(EMPTY_FORM);
    setErrors({});
    setTouched({});
  }

  // Helper: show error only when field has been touched
  function err(field: keyof FormValues): string | undefined {
    return touched[field] ? errors[field] : undefined;
  }

  return (
    <div className="card form-card">
      <h1 className="card-title">Submit a Request</h1>
      <p className="card-subtitle">Fill out the details below to submit a bug, feature request, partnership inquiry, or other feedback.</p>

      <form onSubmit={handleSubmit} noValidate>

        {/* Row 1: name + email */}
        <div className="form-row two-col">
          <div className="field">
            <label htmlFor="field-name">
              Your Name <span className="required">*</span>
            </label>
            <input
              id="field-name"
              type="text"
              placeholder="Jane Smith"
              autoComplete="name"
              value={values.name}
              onChange={e => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              className={err('name') ? 'invalid' : ''}
            />
            <span className="error-msg">{err('name')}</span>
          </div>

          <div className="field">
            <label htmlFor="field-email">
              Email Address <span className="required">*</span>
            </label>
            <input
              id="field-email"
              type="email"
              placeholder="jane@example.com"
              autoComplete="email"
              value={values.email}
              onChange={e => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={err('email') ? 'invalid' : ''}
            />
            <span className="error-msg">{err('email')}</span>
          </div>
        </div>

        {/* Row 2: type + priority */}
        <div className="form-row two-col">
          <div className="field">
            <label htmlFor="field-type">
              Request Type <span className="required">*</span>
            </label>
            <select
              id="field-type"
              value={values.type}
              onChange={e => handleChange('type', e.target.value as SubmissionType | '')}
              onBlur={() => handleBlur('type')}
              className={err('type') ? 'invalid' : ''}
            >
              <option value="">— choose type —</option>
              <option value="bug">Bug</option>
              <option value="feature">Feature Request</option>
              <option value="feedback">General Feedback</option>
              <option value="partnership">Partnership</option>
              <option value="other">Other</option>
            </select>
            <span className="error-msg">{err('type')}</span>
          </div>

          <div className="field">
            <label htmlFor="field-priority">Priority</label>
            <select
              id="field-priority"
              value={values.priority}
              onChange={e => handleChange('priority', e.target.value as Priority)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Message */}
        <div className="field">
          <label htmlFor="field-message">
            Message <span className="required">*</span>
          </label>
          <textarea
            id="field-message"
            rows={6}
            placeholder="Explain your request in detail…"
            maxLength={2000}
            value={values.message}
            onChange={e => handleChange('message', e.target.value)}
            onBlur={() => handleBlur('message')}
            className={err('message') ? 'invalid' : ''}
          />
          <div className="char-count-row">
            <span className="error-msg">{err('message')}</span>
            <span className="char-count">{values.message.length} / 2000</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Submit Request</button>
          <button type="button" className="btn btn-ghost" onClick={handleClear}>Clear Form</button>
        </div>

      </form>
    </div>
  );
}
