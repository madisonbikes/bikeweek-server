export type EventLocation = {
  mapsDescription?: string;
  //freeformMarkdownDescription?: string,
  mapsQuery?: string;
  mapsPlaceId?: string;
  locationFree?: string;
};

export type EventDay = {
  localDate: Date;
};

export type EventTime = {
  start?: string;
  end?: string;
};

export type BikeWeekEvent = {
  id: number;
  approved: boolean;
  name: string;
  eventUrl?: string;
  description: string;
  eventGraphicUrl?: string;
  sponsors: string[];
  sponsorUrls: string[];
  location: EventLocation;
  eventTypes: string[];
  eventDays: EventDay[];
  eventTimes: EventTime[];
};
