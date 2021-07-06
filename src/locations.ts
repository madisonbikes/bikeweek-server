export type EventLocation = {
  id: string;
  sched_venue?: string; // defaults to id
  sched_address: string; // required for specific address info
  maps_query?: string;
  maps_description?: string;
  maps_placeid?: string;
};

export const locations: EventLocation[] = [
  {
    id: "Warner Park @ Forster Dr",
    sched_address: "2930 N Sherman Ave, Madison, WI 53704",
    maps_query: "43.1330677130937, -89.37302929269123"
  },
  {
    id: "Fire Station #9 Lawn (ask Madison Bikes for assistance)",
    sched_venue: "Fire Station #9",
    sched_address: "201 N Midvale Blvd, Madison, WI 53705",
    maps_query: "43.06825658346771, -89.45017880206065"
  },
  {
    id: "Olin Park @ Cap City Trail",
    sched_address: "1156 Olin-Turville Ct, Madison, WI 53715",
    maps_query: "43.05142232402517, -89.37755525648618"
  }
];
