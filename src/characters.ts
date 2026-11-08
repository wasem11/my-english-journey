export const playerCharacter={id:'player',label:'You',identity:'Afghan American woman',heightInches:63,skin:'#A66D46',hair:'#302923',shirt:'#275642',trousers:'#354B49',shoes:'#EEE4D0',hairStyle:'long'} as const;
export const characters={
 player:playerCharacter,
 cashier:{id:'cashier',label:'Alex · Cashier',skin:'#D29B77',hair:'#4C342B',shirt:'#587D77',trousers:'#3E4F59',shoes:'#E7DECE',hairStyle:'short'},
 barista:{id:'barista',label:'Jordan · Barista',skin:'#8B593D',hair:'#282725',shirt:'#B38A57',trousers:'#435652',shoes:'#E4D8BF',hairStyle:'short'},
 librarian:{id:'librarian',label:'Rosa · Librarian',skin:'#C68B64',hair:'#5B493B',shirt:'#9C7587',trousers:'#596676',shoes:'#EADFC9',hairStyle:'long'},
 coordinator:{id:'coordinator',label:'Priya · Activities coordinator',skin:'#A46F45',hair:'#292A27',shirt:'#6D8C91',trousers:'#4A5865',shoes:'#EADFC9',hairStyle:'long'},
 busDriver:{id:'busDriver',label:'Marcus · Bus driver',skin:'#825539',hair:'#262522',shirt:'#648497',trousers:'#394D60',shoes:'#4B4742',hairStyle:'short'},
 postalClerk:{id:'postalClerk',label:'Daniel · Postal clerk',skin:'#E0AD85',hair:'#725845',shirt:'#7492AF',trousers:'#445870',shoes:'#544B43',hairStyle:'short'},
 doctor:{id:'doctor',label:'Dr. Chen · Doctor',skin:'#D3A57D',hair:'#292B2B',shirt:'#F2F0E5',trousers:'#548D90',shoes:'#595E5A',hairStyle:'short'},
 dentist:{id:'dentist',label:'Dr. Rivera · Dentist',skin:'#B97F58',hair:'#3F3028',shirt:'#72A09A',trousers:'#506D78',shoes:'#E6E0D1',hairStyle:'long'},
 schoolOffice:{id:'schoolOffice',label:'Grace · School office',skin:'#E2B38C',hair:'#A18A6B',shirt:'#967F9C',trousers:'#5D606E',shoes:'#E9DCC6',hairStyle:'short'},
 volunteer:{id:'volunteer',label:'Amal · Volunteer organizer',skin:'#A46D48',hair:'#372B26',shirt:'#839D62',trousers:'#546759',shoes:'#EFDFBC',hairStyle:'long'},
 parkParent:{id:'parkParent',label:'Ben · Parent',skin:'#D3A17E',hair:'#634933',shirt:'#A68868',trousers:'#4E6C75',shoes:'#E6D9C0',hairStyle:'short'},
 parent:{id:'parent',label:'Maya · Parent',skin:'#BF895F',hair:'#4A3228',shirt:'#C58B6A',trousers:'#526B69',shoes:'#EFE1C9',hairStyle:'long'},
 teacher:{id:'teacher',label:'Ms. Reed · Teacher',skin:'#E1B591',hair:'#78604A',shirt:'#7B8F79',trousers:'#53586A',shoes:'#765846',hairStyle:'short'},
 neighbor:{id:'neighbor',label:'Nadia · Neighbor',skin:'#986441',hair:'#322A25',shirt:'#9B859C',trousers:'#4E6461',shoes:'#EDE2CC',hairStyle:'long'},
 pharmacist:{id:'pharmacist',label:'Samira · Pharmacist',skin:'#B27B53',hair:'#342A24',shirt:'#F2EDDE',trousers:'#52766B',shoes:'#746252',hairStyle:'short'},
 friend:{id:'friend',label:'Ella · Parent',skin:'#DBA37C',hair:'#744A32',shirt:'#C5A25D',trousers:'#617B7C',shoes:'#EFE6D0',hairStyle:'long'},
 receptionist:{id:'receptionist',label:'Leah · Receptionist',skin:'#8F5E40',hair:'#2D2927',shirt:'#7B9D9B',trousers:'#465E65',shoes:'#E7D7BD',hairStyle:'short'},
} as const;
export type CharacterId=keyof typeof characters;
