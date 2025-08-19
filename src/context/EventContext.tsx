
'use client';

import * as React from 'react';
import type { Event } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, Timestamp, orderBy } from 'firebase/firestore';

interface EventContextType {
  events: Event[];
  loading: boolean;
  toggleEventCompletion: (eventId: string, isCompleted: boolean) => Promise<void>;
  addEvent: (newEvent: Omit<Event, 'id' | 'ownerId'>) => Promise<void>;
  showCompleted: boolean;
  setShowCompleted: React.Dispatch<React.SetStateAction<boolean>>;
}

const EventContext = React.createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCompleted, setShowCompleted] = React.useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, where('ownerId', '==', user.uid), orderBy('startTime', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userEvents: Event[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userEvents.push({
          id: doc.id,
          ...data,
          startTime: (data.startTime as Timestamp).toDate(),
          endTime: (data.endTime as Timestamp).toDate(),
        } as Event);
      });
      setEvents(userEvents);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching events: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);


  const toggleEventCompletion = async (eventId: string, isCompleted: boolean) => {
    const eventRef = doc(db, 'events', eventId);
    try {
        await updateDoc(eventRef, {
            isCompleted: isCompleted
        });
    } catch (error) {
        console.error("Error updating event: ", error);
    }
  };

  const addEvent = async (newEvent: Omit<Event, 'id' | 'ownerId'>) => {
    if (!user) {
        throw new Error("You must be logged in to add an event.");
    }
    try {
        await addDoc(collection(db, 'events'), {
            ...newEvent,
            ownerId: user.uid,
        });
    } catch (error) {
        console.error("Error adding event: ", error);
    }
  };

  return (
    <EventContext.Provider value={{ events, loading, toggleEventCompletion, addEvent, showCompleted, setShowCompleted }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = React.useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}
