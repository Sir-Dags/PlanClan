
export type ClanMember = {
  id: string;
  name: string;
  avatar: string;
};

export type Event = {
  id: string;
  title: string;
  category: 'Appointment' | 'Task' | 'Activity' | 'Reminder';
  startTime: Date;
  endTime: Date;
  assignedMemberIds: string[];
  orAssignedMemberIds?: string[];
  description?: string;
  isRecurring?: boolean;
  conflictingEvent?: string;
  isCompleted?: boolean;
  // UID of user who created the event
  ownerId: string;
};
