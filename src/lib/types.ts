
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
  // ownerId is no longer needed as events are in a subcollection
  // ownerId: string;
};
