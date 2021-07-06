export type EventLocation = {
  id: string;
  sched_venue?: string; // defaults to id
  sched_address?: string; // required for specific address info
  maps_query?: string;
  maps_description?: string;
  maps_placeid?: string;
};

export const locations: EventLocation[] = [
  {
    id: "Warner Park @ Forster Dr",
    sched_address: "2930 N Sherman Ave, Madison, WI 53704",
    maps_query: "43.1330677130937, -89.37302929269123",
  },
  {
    id: "Fire Station #9 Lawn (ask Madison Bikes for assistance)",
    sched_venue: "Fire Station #9",
    sched_address: "201 N Midvale Blvd, Madison, WI 53705",
    maps_query: "43.06825658346771, -89.45017880206065",
  },
  {
    id: "Olin Park @ Cap City Trail",
    sched_address: "1156 Olin-Turville Ct, Madison, WI 53715",
    maps_query: "43.05142232402517, -89.37755525648618",
  },
  {
    id: "The Velo UnderRound",
    sched_address: "Capital City Trail, Fitchburg, WI 53711",
    maps_query: "43.02384174161428, -89.46118663604771",
    maps_placeid: "ChIJtTh2R_GtB4gR3FXbJot9IvU",
  },
  {
    id: "Capital City Path @ Jackson St.",
    maps_query: "43.09362734540651, -89.3487495229572",
  },
  {
    id: "Cap City @ E. Wilson/Ingersoll",
    maps_query: "43.08226898474152, -89.36764332963402",
  },
  {
    id: "Cap City @ South Dickinson Street",
    maps_query: "43.08649669029604, -89.36153934123017",
  },
  {
    id: "Crazylegs Plaza",
    maps_query: "43.067625512497706, -89.41344863570794",
  },
  {
    id: "Cap City @ First St",
    maps_query: "43.0897922154192, -89.35602172894029",
  },
  {
    id: "Garver Feed Mill @ Cap City",
    maps_query: "43.09434025402559, -89.33485600010425",
  },
  {
    id: "Cap City @ Monona Terrace",
    maps_query: "43.068865430910314, -89.38371336452231",
  },
  {
    id: "Yahara River Path @ Tenney Park (parking lot)",
    maps_query: "43.09247834276359, -89.36698561492226",
  },
  {
    id: "Madison Municipal Building",
    maps_query: "43.073056383370364, -89.38155318859431",
  },
  {
    id: "Brittingham Park",
    maps_query: "43.06365600662153, -89.39757271957343",
  },
  {
    id: "Starkweather Creek Path @ Commercial Avenue",
    maps_query: "43.106834039270574, -89.3256283203315",
  },
  {
    id: "Cap City @ Dempsey Road",
    maps_query: "43.08618421761168, -89.31618731793283",
  },
  {
    id: "SW Commuter Path @ Spring/Charter",
    maps_query: "43.06949884864831, -89.40600454474001",
  },
  {
    id: "Lussier Community Education Center",
    maps_query: "43.06630758865517, -89.50196921513945",
  },
  {
    id: "North Paterson Street & East Mifflin Street (Reynolds Park)",
    maps_query: "43.08293952681019, -89.37557016431424",
  },
  {
    id: "Pinney Library",
    maps_query: "43.08433667433231, -89.31788920164708",
  },
  {
    id: "Burrows Park @ Harbort Dr.",
    maps_query: "43.10167389021605, -89.36549950940855",
  },
  {
    id: "Cannonball Path @ Leopold School",
    maps_query: "43.02998555178269, -89.42103494908382",
  },
  {
    id: "William Slater Park (Tokay @ Segoe)",
    maps_query: "43.053816772589244, -89.46474118090218",
  },
  {
    id: "Capital City Path @ Amoth Ct",
    maps_query: "43.09104576170086, -89.35365142809567",
  },
  {
    id: "SW Commuter Path @ Midvale",
    maps_query: "43.04631890556104, -89.4515052750167",
  },
  {
    id: "SW Commuter Path @ Hammersley (Beltline)",
    maps_query: "43.03931326289994, -89.45981443133269",
  },
  {
    id: "SW Commuter Path @ Carling Dr.",
    maps_query: "43.03089706471058, -89.46009832971829",
  },
  {
    id: "Wingra Creek Path @ Fish Hatchery",
    maps_query: "43.0501333497925, -89.39995404541845",
  },
  {
    id: "Wingra Creek Path @ Olin Ave",
    maps_query: "43.05268012723853, -89.38292629027862",
  },
  {
    id: "Wingra Creek Path @ Arboretum",
    maps_query: "43.05692598905787, -89.40408758819244",
  },
  {
    id: "Starkweather Creek Path @ Darbo",
    maps_query: "43.10366513048974, -89.34094395101857",
  },
  {
    id: "Southshore Bike Blvd @ Bernie’s Beach",
    maps_query: "43.05688298752837, -89.38944696431811",
  },
  {
    id: "Penn Park @ Fisher St.",
    maps_query: "43.04254401115383, -89.39168911041875",
  },
  {
    id: "Slow Street: Sherman Ave",
    maps_query: "43.089750,-89.3745",
  },
  {
    id: "Slow Street: W/S Shore Blvd",
    maps_query: "43.056919, -89.396572",
  },
  {
    id: "Slow Street: E Mifflin St",
    maps_query: "43.081279, -89.377122",
  },
  {
    id: "Slow Street: Fisher St",
    maps_query: "43.044754, -89.391824",
  },
  {
    id: "Slow Street: Darbo Dr",
    maps_query: "43.103530, -89.340504",
  }
];
