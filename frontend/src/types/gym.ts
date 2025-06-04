export type ID = string | number;

export interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export type Gym = {
  id: number;
  name: string;
  address: string;
  description: string;
  contactInfo: string;
  imageUrl: string | null;
  ownerId: number;
  createdAt: string;
  _count: {
    classes: number; 
    membershipPlans: number; 
  }
};

export interface GymClass { // this is called from getclass by gym
  id: number;
  gymId: number;
  name: string;
  description: string;
  maxCapacity: number;
  durationMinutes: number;
  imageUrl: string;
  membersOnly: boolean;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
}

export type GymClassWithDetails = { // this is called from getclass, class section api
  id: number;
  gymId: number;
  name: string;
  description: string;
  maxCapacity: number | null;
  durationMinutes: number;
  imageUrl: string | null;
  membersOnly: boolean;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced'; 
  isActive: boolean;
  createdAt: string;
  gym: { 
    id: number;
    name: string;
    address: string;
  };
  schedules: Schedule[]; 
}


export type Schedule = {
  id: number;
  classId: number;
  startTime: string; 
  endTime: string; 
  instructor: string | null;
  currentBookings: number;
  isCancelled: boolean;
  cancellationReason: string | null;
  createdAt: string; 
  gymClass: { 
    name: string;
    maxCapacity: number | null;
    durationMinutes: number;
    membersOnly: boolean;
  };
  _count: { 
    userBookings: number;
  };
  spotsAvailable: number;
  isFull: boolean;
};

export type MembershipStatus = "active" | "cancelled" | "expired" | string; // Added string for potential future statuses


export interface MembershipPlan {
  id: ID;
  gymId: ID;
  name: string;
  description: string;
  durationDays: number;
  price: string; 
  maxBookingsPerWeek: number ;
  isActive: boolean;
  checkoutUrl: string;
  createdAt: string;
}

export type UserMembership = { // this is called from get my-membership, membership section
  id: number;
  userId: number;
  gymId: number;
  planId: number;
  startDate: string; 
  endDate: string; 
  status: MembershipStatus; 
  autoRenew: boolean;
  bookingsUsedThisWeek: number;
  lastBookingCountReset: string;
  createdAt: string; 
  gym: { 
    id: number;
    name: string;
    address: string;
    imageUrl: string | null;
  };
  membershipPlan: {
    id: number;
    gymId: number;
    name: string;
    description: string;
    durationDays: number;
    price: string; 
    maxBookingsPerWeek: number;
    isActive: boolean;
    createdAt: string;
  };
};




// API Response interfaces
export interface ApiResponse<T> {
  status: string;
  results: number;
  pagination?: Pagination;
  data: T;
}



export type BookingStatus = 'confirmed' | 'cancelled' | 'attended';

export interface Booking { // from get my-bookings and same for upcoming booking
  id: number;
  userId: number;
  membershipId: number;
  scheduleId: number;
  bookingTime: string;
  bookingStatus: BookingStatus;
  cancellationReason: string | null;
  attended: boolean;
  createdAt: string;
  schedule: {
    id: number;
    classId: number;
    startTime: string;
    endTime: string;
    instructor: string;
    currentBookings: number;
    isCancelled: boolean;
    cancellationReason: string | null;
    createdAt: string;
    gymClass: {
      id: number;
      gymId: number;
      name: string;
      description: string;
      maxCapacity: number | null;
      durationMinutes: number;
      imageUrl: string | null;
      membersOnly: boolean;
      difficultyLevel: string;
      isActive: boolean;
      createdAt: string;
      gym: {
        id: number;
        name: string;
      };
    };
  };

  // there is data is from backend but not used, so that we can match with booking history 
  // userMembership: {
  //   id: number;
  //   status: string;
  // };
}

export interface BookingHistory { // this is from get booking history  
  id: number;
  userId: number;
  membershipId: number | null;
  scheduleId: number;
  bookingTime: string; 
  bookingStatus: BookingStatus;
  cancellationReason: string | null;
  attended: boolean;
  createdAt: string; 
  schedule: { 
    id: number;
    classId: number;
    startTime: string;
    endTime: string; 
    instructor: string | null; 
    currentBookings: number;
    isCancelled: boolean;
    cancellationReason: string | null;
    createdAt: string; 
    gymClass: { 
      id: number;
      gymId: number;
      name: string;
      description: string;
      maxCapacity: number | null;
      durationMinutes: number;
      imageUrl: string | null;
      membersOnly: boolean;
      difficultyLevel: string;
      isActive: boolean;
      createdAt: string; 
      gym: { 
        id: number;
        name: string;
      };
    };
  };
  // no userMembership for booking history
}

export interface DetailedBooking { // this is from get booking by booking id
  id: number;
  userId: number;
  membershipId: number | null;
  scheduleId: number;
  bookingTime: string;
  bookingStatus: string;
  cancellationReason: string | null;
  attended: boolean;
  createdAt: string;
  schedule: {
    id: number;
    classId: number;
    startTime: string;
    endTime: string;
    instructor: string | null;
    currentBookings: number;
    isCancelled: boolean;
    cancellationReason: string | null;
    createdAt: string;
    gymClass: {
      id: number;
      gymId: number;
      name: string;
      description: string;
      maxCapacity: number | null;
      durationMinutes: number;
      imageUrl: string | null;
      membersOnly: boolean;
      difficultyLevel: string;
      isActive: boolean;
      createdAt: string;
      gym: {
        id: number;
        name: string;
        address: string;
        contactInfo: string;
      };
    };
  };
  userMembership: {
    id: number;
    userId: number;
    gymId: number;
    planId: number;
    startDate: string;
    endDate: string;
    status: string;
    autoRenew: boolean;
    bookingsUsedThisWeek: number;
    lastBookingCountReset: string;
    createdAt: string;
    membershipPlan: {
      id: number;
      gymId: number;
      name: string;
      description: string;
      durationDays: number;
      price: string;
      maxBookingsPerWeek: number;
      isActive: boolean;
      createdAt: string;
    };
  };
}

export interface GymsApiResponse extends ApiResponse<Gym[]> {}
export interface ClassesApiResponse extends ApiResponse<GymClass[]> {}
export interface SchedulesApiResponse extends ApiResponse<Schedule[]> {}