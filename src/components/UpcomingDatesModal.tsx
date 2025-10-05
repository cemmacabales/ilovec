import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { X, Plus, Check } from 'lucide-react';
import { addEvent, fetchEvents, deleteEvent, updateEvent, updateEventComplete } from '../services/supabase';

interface Event {
  id: string;
  title: string;
  date?: string; // legacy
  event_date?: string; // Supabase column
  time: string;
  event_time?: string;
  location?: string;
  event_complete?: boolean;
  description?: string;
}

interface UpcomingDatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpcomingDatesModal: React.FC<UpcomingDatesModalProps> = ({ isOpen, onClose }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editForm, setEditForm] = useState({ title: '', event_date: '', event_time: '', location: '' });
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '' });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  // Fix timezone offset for selected date
  const selectedDateStr = selectedDate
    ? new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
    : '';

  // Fetch events from Supabase on mount
  useEffect(() => {
    if (isOpen) {
      (async () => {
        const { data } = await fetchEvents();
        // Map event_date to date for compatibility
        const mappedEvents = (data || []).map(event => ({
          ...event,
          date: event.event_date || event.date,
          time: event.event_time || event.time
        }));
        setEvents(mappedEvents);
      })();
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setShowAddForm(false);
      setNewEvent({ title: '', date: '', time: '', location: '' });
    }, 200);
  };

  const handleAddEvent = async () => {
    if (newEvent.title && newEvent.date && newEvent.time) {
      await addEvent({
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        location: newEvent.location,
        event_complete: false
      });
      // Refresh events from Supabase
      const { data } = await fetchEvents();
      const mappedEvents = (data || []).map(event => ({
        ...event,
        date: event.event_date || event.date,
        time: event.event_time || event.time
      }));
      setEvents(mappedEvents);
      setNewEvent({ title: '', date: '', time: '', location: '' });
      setShowAddForm(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    await deleteEvent(id);
    const { data } = await fetchEvents();
    const mappedEvents = (data || []).map(event => ({
      ...event,
      date: event.event_date || event.date,
      time: event.event_time || event.time
    }));
    setEvents(mappedEvents);
  };

  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) {
      return '—';
    }
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isClosing ? 'modal-overlay-closing' : ''}`} onClick={handleClose}>
      <div className={`modal-content ${isClosing ? 'modal-content-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upcoming Dates</h2>
          <button className="close-button" onClick={handleClose}>
            <X />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="calendar-events-grid">
            <div className="calendar-ui-section">
              <div className="calendar-ui-header">
                <span className="calendar-ui-title">Select a date</span>
              </div>
              <Calendar
                onChange={(date) => setSelectedDate(date as Date)}
                value={selectedDate}
                className="custom-calendar"
                tileContent={({ date, view }) => {
                  if (view !== 'month') return null;
                  // Fix calendar date to local date string (not UTC)
                  const dateStr = [
                    date.getFullYear(),
                    String(date.getMonth() + 1).padStart(2, '0'),
                    String(date.getDate()).padStart(2, '0')
                  ].join('-');
                  const hasEvent = events.some(ev => ev.date === dateStr);
                  return hasEvent ? <span className="event-dot" /> : null;
                }}
                tileClassName={({ date }) => {
                  const dateStr = [
                    date.getFullYear(),
                    String(date.getMonth() + 1).padStart(2, '0'),
                    String(date.getDate()).padStart(2, '0')
                  ].join('-');
                  return events.some(ev => ev.date === dateStr) ? 'event-date-highlight' : undefined;
                }}
              />
            </div>
            <div className="events-pane">
              <div className="events-pane-header">
                <div>
                  <h3>Events for {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'All Dates'}</h3>
                  <span className="events-count">{selectedDate ? events.filter(e => e.date === selectedDateStr).length : events.length} {selectedDate ? 'event(s)' : 'total'}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {selectedDate && (
                    <button 
                      className="add-event-button"
                      style={{ background: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)' }}
                      onClick={() => setSelectedDate(null)}
                    >
                      Show All Events
                    </button>
                  )}
                  <button 
                    className="add-event-button"
                    onClick={() => {
                      setShowAddForm(!showAddForm);
                      if (!showAddForm) {
                        setNewEvent({
                          ...newEvent,
                          date: selectedDateStr || "",
                        });
                      }
                    }}
                  >
                    <Plus /> Add Event
                  </button>
                </div>
              </div>
              {showAddForm && (
                <div className="add-event-form">
                  <input
                    type="text"
                    placeholder="Event title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  />
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    disabled={!!selectedDate}
                    style={selectedDate ? { background: "#f7f5f3", color: "#6b6358", cursor: "not-allowed" } : {}}
                  />
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Location (optional)"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  />
                  <div className="form-buttons">
                    <button className="save-button" onClick={handleAddEvent}>
                      Save Event
                    </button>
                    <button className="cancel-button" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              <div className="events-list compact-grid">
                {(() => {
                  const list = selectedDate ? events.filter(e => e.date === selectedDateStr) : events;
                  if (list.length === 0) {
                    return (
                      <div className="empty-events-card">
                        <p>No events {selectedDate ? 'for this date yet.' : 'scheduled yet.'}</p>
                      </div>
                    );
                  }
                  return list.map((event) => (
                    <div key={event.id} className={`event-card ${event.event_complete ? 'completed' : ''}`}>
                      <div className="event-header">
                        <button
                          className="event-checkbox"
                          aria-checked={event.event_complete ? 'true' : 'false'}
                          onClick={async () => {
                            await updateEventComplete(event.id, !event.event_complete);
                            const { data } = await fetchEvents();
                            const mappedEvents = (data || []).map(event => ({
                              ...event,
                              date: event.event_date || event.date,
                              time: event.event_time || event.time
                            }));
                            setEvents(mappedEvents);
                          }}
                        >
                          <Check />
                        </button>
                        <div className="event-actions">
                          <button
                            className="edit-btn"
                            onClick={() => {
                              setEditingEvent(event);
                              setEditForm({
                                title: event.title,
                                event_date: event.event_date ?? event.date ?? '',
                                event_time: event.event_time ?? event.time ?? '',
                                location: event.location ?? ''
                              });
                              setShowEditForm(true);
                            }}
                          >
                            <Plus />
                          </button>
                          <button className="delete-btn" onClick={() => handleDeleteEvent(event.id)}>
                            <X />
                          </button>
                        </div>
                      </div>
                      <div className="event-content">
                        <h4 className="event-title">{event.title}</h4>
                        <div className="event-meta">
                          <span className="event-date">
                            <span className="event-date-number" style={{ fontWeight: 'bold' }}>{(() => {
                              const dateStr = event.event_date ?? event.date;
                              if (!dateStr) return '—';
                              const d = new Date(dateStr);
                              return isNaN(d.getDate()) ? '—' : d.getDate();
                            })()}</span>
                            <span className="event-date-month" style={{ fontWeight: 'bold' }}>{(() => {
                              const dateStr = event.event_date ?? event.date;
                              if (!dateStr) return '—';
                              const d = new Date(dateStr);
                              return isNaN(d.getMonth()) ? '—' : d.toLocaleString('en-US', { month: 'short' });
                            })()}</span>
                          </span>
                          <span className="event-time">
                            <svg width="16" height="16" viewBox="0 0 24 24" style={{verticalAlign: 'middle'}}><path d="M12 8v5l4 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                            {formatTime(event.event_time ?? event.time)}
                          </span>
                          {event.location && <span className="event-location"><svg width="16" height="16" viewBox="0 0 24 24" style={{verticalAlign: 'middle'}}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" fill="#d4a574"/></svg> {event.location}</span>}
                          {selectedDate && event.date === selectedDateStr && (
                            <span className="selected-label">Selected</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>

          {showEditForm && editingEvent && (
            <div className="edit-event-form minimal-compact-modern">
              <div className="edit-fields-row">
                <input
                  type="text"
                  className="edit-input"
                  placeholder="Title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                />
                <input
                  type="date"
                  className="edit-input"
                  value={editForm.event_date}
                  onChange={(e) => setEditForm({...editForm, event_date: e.target.value})}
                />
                <input
                  type="time"
                  className="edit-input"
                  value={editForm.event_time}
                  onChange={(e) => setEditForm({...editForm, event_time: e.target.value})}
                />
                <input
                  type="text"
                  className="edit-input"
                  placeholder="Location"
                  value={editForm.location}
                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                />
              </div>
              <div className="form-buttons compact-buttons">
                <button
                  className="save-button modern-btn"
                  onClick={async () => {
                    await updateEvent(editingEvent.id, {
                      title: editForm.title,
                      event_date: editForm.event_date,
                      event_time: editForm.event_time,
                      location: editForm.location
                    });
                    const { data } = await fetchEvents();
                    const mappedEvents = (data || []).map(event => ({
                      ...event,
                      date: event.event_date || event.date,
                      time: event.event_time || event.time
                    }));
                    setEvents(mappedEvents);
                    setShowEditForm(false);
                    setEditingEvent(null);
                  }}
                >
                  Save
                </button>
                <button className="cancel-button modern-btn" onClick={() => setShowEditForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpcomingDatesModal;
