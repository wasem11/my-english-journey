import {adventureExtras} from './dmvAdventureExtras';
// Original educational practice questions; NOT official California DMV exam items.
// Review against the current California Driver Handbook before relying on legal details.
export type DMVQuestion={id:string;topic:string;chapter:string;question:string;options:string[];answer:number;explanation:string};
export const dmvQuestionBank:DMVQuestion[]=[
 {
  "id": "ca-001",
  "topic": "Signs",
  "chapter": "Traffic control",
  "question": "At a STOP sign, what must a driver do?",
  "options": [
   "Stop completely",
   "Slow without stopping",
   "Stop only at night"
  ],
  "answer": 0,
  "explanation": "Stop completely before proceeding when safe."
 },
 {
  "id": "ca-002",
  "topic": "Signs",
  "chapter": "Traffic control",
  "question": "What does a YIELD sign require?",
  "options": [
   "Give right-of-way when needed",
   "Always stop for ten seconds",
   "Accelerate into traffic"
  ],
  "answer": 0,
  "explanation": "Slow and yield; stop if necessary."
 },
 {
  "id": "ca-003",
  "topic": "Signs",
  "chapter": "Traffic control",
  "question": "A red-and-white WRONG WAY sign means what?",
  "options": [
   "You are traveling against permitted traffic",
   "A construction detour begins",
   "The road is closed only at night"
  ],
  "answer": 0,
  "explanation": "Do not continue in the wrong direction."
 },
 {
  "id": "ca-004",
  "topic": "Signs",
  "chapter": "Traffic control",
  "question": "A DO NOT ENTER sign warns drivers to do what?",
  "options": [
   "Avoid entering that roadway",
   "Proceed slowly",
   "Enter only to turn around"
  ],
  "answer": 0,
  "explanation": "The entrance is prohibited."
 },
 {
  "id": "ca-005",
  "topic": "Signs",
  "chapter": "Traffic control",
  "question": "What does a diamond-shaped yellow sign generally indicate?",
  "options": [
   "A warning or hazard ahead",
   "A hospital entrance",
   "A parking zone"
  ],
  "answer": 0,
  "explanation": "Yellow diamond signs generally warn of conditions ahead."
 },
 {
  "id": "ca-006",
  "topic": "Signs",
  "chapter": "Traffic control",
  "question": "What does an orange road sign usually mean?",
  "options": [
   "Construction or maintenance warning",
   "A scenic route",
   "Free parking"
  ],
  "answer": 0,
  "explanation": "Orange warns of road work or temporary conditions."
 },
 {
  "id": "ca-007",
  "topic": "Signs",
  "chapter": "Traffic control",
  "question": "What does a pentagon-shaped school sign indicate?",
  "options": [
   "A school-related crossing or area",
   "A freeway entrance",
   "A railroad station"
  ],
  "answer": 0,
  "explanation": "Watch carefully for children and follow signs."
 },
 {
  "id": "ca-008",
  "topic": "Signs",
  "chapter": "Traffic control",
  "question": "What does a round yellow railroad warning sign mean?",
  "options": [
   "A railroad crossing is ahead",
   "A roundabout is required",
   "A bus stop is ahead"
  ],
  "answer": 0,
  "explanation": "Approach railroad crossings carefully."
 },
 {
  "id": "ca-009",
  "topic": "Signs",
  "chapter": "Traffic control",
  "question": "What does a white rectangular speed-limit sign show?",
  "options": [
   "The posted maximum speed under ideal conditions",
   "A suggested minimum speed",
   "A speed for motorcycles only"
  ],
  "answer": 0,
  "explanation": "Travel no faster than the posted limit and slower when necessary."
 },
 {
  "id": "ca-010",
  "topic": "Signs",
  "chapter": "Traffic control",
  "question": "What does a red circle with a slash over a turn arrow indicate?",
  "options": [
   "That turn is prohibited",
   "That turn is required",
   "That turn is recommended"
  ],
  "answer": 0,
  "explanation": "A slash indicates the depicted movement is prohibited."
 },
 {
  "id": "ca-011",
  "topic": "Signals",
  "chapter": "Traffic control",
  "question": "At a steady red light, what is required?",
  "options": [
   "Stop before the limit line or crosswalk",
   "Speed up",
   "Honk before proceeding"
  ],
  "answer": 0,
  "explanation": "Stop; certain turns may be legal after stopping and yielding."
 },
 {
  "id": "ca-012",
  "topic": "Signals",
  "chapter": "Traffic control",
  "question": "What should you do at a steady yellow signal?",
  "options": [
   "Stop if you can safely do so",
   "Always accelerate",
   "Reverse out of the intersection"
  ],
  "answer": 0,
  "explanation": "Yellow warns that red is coming."
 },
 {
  "id": "ca-013",
  "topic": "Signals",
  "chapter": "Traffic control",
  "question": "What does a flashing red signal require?",
  "options": [
   "Treat it like a stop sign",
   "Keep moving without stopping",
   "Yield only to trucks"
  ],
  "answer": 0,
  "explanation": "Stop fully and proceed when safe."
 },
 {
  "id": "ca-014",
  "topic": "Signals",
  "chapter": "Traffic control",
  "question": "What does a flashing yellow signal mean?",
  "options": [
   "Proceed cautiously",
   "Stop and wait for green",
   "The intersection is closed"
  ],
  "answer": 0,
  "explanation": "Slow down and proceed carefully."
 },
 {
  "id": "ca-015",
  "topic": "Signals",
  "chapter": "Traffic control",
  "question": "At a green light, who must you still yield to?",
  "options": [
   "Pedestrians and traffic already in the intersection",
   "Nobody",
   "Only large trucks"
  ],
  "answer": 0,
  "explanation": "A green light does not eliminate other right-of-way duties."
 },
 {
  "id": "ca-016",
  "topic": "Signals",
  "chapter": "Traffic control",
  "question": "A green arrow permits which movement?",
  "options": [
   "The movement indicated by the arrow when safe",
   "Any movement you want",
   "Only a U-turn"
  ],
  "answer": 0,
  "explanation": "Follow the arrow and watch for hazards."
 },
 {
  "id": "ca-017",
  "topic": "Signals",
  "chapter": "Traffic control",
  "question": "When traffic signals are dark due to an outage, what should you do?",
  "options": [
   "Treat the intersection as an all-way stop",
   "Assume you have priority",
   "Drive through quickly"
  ],
  "answer": 0,
  "explanation": "Stop and use all-way-stop rules unless directed otherwise."
 },
 {
  "id": "ca-018",
  "topic": "Signals",
  "chapter": "Traffic control",
  "question": "What does a solid red arrow generally mean?",
  "options": [
   "Do not make the movement shown",
   "Turn after honking",
   "Proceed if there is no traffic"
  ],
  "answer": 0,
  "explanation": "Wait until a signal permits the movement."
 },
 {
  "id": "ca-019",
  "topic": "Right of way",
  "chapter": "Right-of-way",
  "question": "At an uncontrolled intersection, who generally has priority when two cars arrive together?",
  "options": [
   "The driver on the right",
   "The driver on the left",
   "The faster driver"
  ],
  "answer": 0,
  "explanation": "Yield to the vehicle on your right."
 },
 {
  "id": "ca-020",
  "topic": "Right of way",
  "chapter": "Right-of-way",
  "question": "When turning left across oncoming traffic, who yields?",
  "options": [
   "The turning driver",
   "The oncoming driver",
   "Pedestrians only"
  ],
  "answer": 0,
  "explanation": "Yield to approaching vehicles close enough to be hazardous."
 },
 {
  "id": "ca-021",
  "topic": "Right of way",
  "chapter": "Right-of-way",
  "question": "When entering a roadway from a driveway, who must you yield to?",
  "options": [
   "Road users already on the roadway",
   "Nobody",
   "Only buses"
  ],
  "answer": 0,
  "explanation": "Yield to traffic and pedestrians before entering."
 },
 {
  "id": "ca-022",
  "topic": "Right of way",
  "chapter": "Right-of-way",
  "question": "At a four-way stop, who normally proceeds first?",
  "options": [
   "The vehicle that stopped first",
   "The largest vehicle",
   "The driver who flashes lights"
  ],
  "answer": 0,
  "explanation": "First to stop generally goes first; resolve ties by yielding right."
 },
 {
  "id": "ca-023",
  "topic": "Right of way",
  "chapter": "Right-of-way",
  "question": "Who has priority in a marked crosswalk?",
  "options": [
   "Pedestrians crossing lawfully",
   "Drivers who are late",
   "Only pedestrians with bicycles"
  ],
  "answer": 0,
  "explanation": "Drivers must yield to pedestrians as required."
 },
 {
  "id": "ca-024",
  "topic": "Right of way",
  "chapter": "Right-of-way",
  "question": "When an emergency vehicle approaches with siren and red lights, what should you generally do?",
  "options": [
   "Pull to the right and stop when safe",
   "Follow it closely",
   "Stop in the middle of the intersection"
  ],
  "answer": 0,
  "explanation": "Yield safely to emergency vehicles."
 },
 {
  "id": "ca-025",
  "topic": "Right of way",
  "chapter": "Right-of-way",
  "question": "At a roundabout, who has the right-of-way?",
  "options": [
   "Traffic already circulating",
   "Vehicles entering",
   "Vehicles that honk"
  ],
  "answer": 0,
  "explanation": "Yield before entering a roundabout."
 },
 {
  "id": "ca-026",
  "topic": "Right of way",
  "chapter": "Right-of-way",
  "question": "When making a right turn, what must you check?",
  "options": [
   "Pedestrians and bicycles crossing your path",
   "Only the rearview mirror",
   "Only your speed"
  ],
  "answer": 0,
  "explanation": "Turn only when the path is clear and legal."
 },
 {
  "id": "ca-027",
  "topic": "Speed",
  "chapter": "Speed and space",
  "question": "Is the posted speed limit always a safe speed?",
  "options": [
   "No, conditions may require slower driving",
   "Yes, always",
   "Only at night"
  ],
  "answer": 0,
  "explanation": "Use a safe speed for weather, traffic and visibility."
 },
 {
  "id": "ca-028",
  "topic": "Speed",
  "chapter": "Speed and space",
  "question": "What is California's basic speed law?",
  "options": [
   "Never drive faster than is safe for conditions",
   "Always drive the posted maximum",
   "Always drive 65 mph"
  ],
  "answer": 0,
  "explanation": "Choose a safe speed regardless of the posted maximum."
 },
 {
  "id": "ca-029",
  "topic": "Speed",
  "chapter": "Speed and space",
  "question": "In heavy fog, how should you drive?",
  "options": [
   "Reduce speed and increase following distance",
   "Use high beams and speed up",
   "Follow taillights closely"
  ],
  "answer": 0,
  "explanation": "Allow extra time and space."
 },
 {
  "id": "ca-030",
  "topic": "Speed",
  "chapter": "Speed and space",
  "question": "What should you do when approaching a sharp curve?",
  "options": [
   "Slow before entering the curve",
   "Brake hard mid-curve",
   "Accelerate before you can see"
  ],
  "answer": 0,
  "explanation": "Reduce speed ahead of the curve."
 },
 {
  "id": "ca-031",
  "topic": "Speed",
  "chapter": "Speed and space",
  "question": "What is the safest response to heavy rain?",
  "options": [
   "Slow down and leave more space",
   "Use cruise control",
   "Drive close to the car ahead"
  ],
  "answer": 0,
  "explanation": "Wet roads reduce traction and increase stopping distance."
 },
 {
  "id": "ca-032",
  "topic": "Speed",
  "chapter": "Speed and space",
  "question": "What should you do when you cannot see far enough ahead to stop safely?",
  "options": [
   "Reduce your speed",
   "Maintain highway speed",
   "Use the horn continuously"
  ],
  "answer": 0,
  "explanation": "Always be able to stop within the distance you can see."
 },
 {
  "id": "ca-033",
  "topic": "Lane use",
  "chapter": "Lane control",
  "question": "Before changing lanes, what should you do?",
  "options": [
   "Signal and check mirrors and blind spots",
   "Look only straight ahead",
   "Change lanes without signaling"
  ],
  "answer": 0,
  "explanation": "Make sure the adjacent lane is clear."
 },
 {
  "id": "ca-034",
  "topic": "Lane use",
  "chapter": "Lane control",
  "question": "What do solid double yellow center lines generally mean?",
  "options": [
   "Do not cross to pass",
   "Passing is always allowed",
   "The road is one-way"
  ],
  "answer": 0,
  "explanation": "Crossing is limited to specific lawful situations."
 },
 {
  "id": "ca-035",
  "topic": "Lane use",
  "chapter": "Lane control",
  "question": "What does a broken white line between lanes indicate?",
  "options": [
   "Lane changes may be permitted when safe",
   "Never change lanes",
   "Opposing traffic"
  ],
  "answer": 0,
  "explanation": "Check before changing lanes."
 },
 {
  "id": "ca-036",
  "topic": "Lane use",
  "chapter": "Lane control",
  "question": "Why should you avoid driving in another vehicle's blind spot?",
  "options": [
   "The other driver may not see you",
   "It improves visibility",
   "It gives you right-of-way"
  ],
  "answer": 0,
  "explanation": "Move where the driver can see you."
 },
 {
  "id": "ca-037",
  "topic": "Lane use",
  "chapter": "Lane control",
  "question": "When entering a freeway, what is important?",
  "options": [
   "Match traffic speed safely and yield",
   "Stop at the end of every ramp",
   "Force vehicles to brake"
  ],
  "answer": 0,
  "explanation": "Merge when a safe gap is available."
 },
 {
  "id": "ca-038",
  "topic": "Lane use",
  "chapter": "Lane control",
  "question": "If you miss a freeway exit, what should you do?",
  "options": [
   "Continue to the next exit",
   "Reverse on the shoulder",
   "Make a U-turn"
  ],
  "answer": 0,
  "explanation": "Never back up on a freeway."
 },
 {
  "id": "ca-039",
  "topic": "Lane use",
  "chapter": "Lane control",
  "question": "Why should you signal before a turn?",
  "options": [
   "To warn others of your intended movement",
   "To claim right-of-way",
   "To make others stop automatically"
  ],
  "answer": 0,
  "explanation": "Signals communicate intent but do not grant priority."
 },
 {
  "id": "ca-040",
  "topic": "Lane use",
  "chapter": "Lane control",
  "question": "What is the purpose of a center left-turn lane?",
  "options": [
   "Preparing for a left turn",
   "Passing slow vehicles",
   "Long-distance travel"
  ],
  "answer": 0,
  "explanation": "Use it only for permitted left-turn movements."
 },
 {
  "id": "ca-041",
  "topic": "Parking",
  "chapter": "Turning and parking",
  "question": "When parking downhill beside a curb, which way should the front wheels face?",
  "options": [
   "Toward the curb",
   "Away from the curb",
   "Straight ahead always"
  ],
  "answer": 0,
  "explanation": "Position wheels to prevent the vehicle from rolling into traffic."
 },
 {
  "id": "ca-042",
  "topic": "Parking",
  "chapter": "Turning and parking",
  "question": "When parking uphill beside a curb, which way should the front wheels face?",
  "options": [
   "Away from the curb",
   "Toward the curb",
   "Any direction"
  ],
  "answer": 0,
  "explanation": "Use the curb and parking brake to help secure the vehicle."
 },
 {
  "id": "ca-043",
  "topic": "Parking",
  "chapter": "Turning and parking",
  "question": "What does a red-painted curb indicate?",
  "options": [
   "No stopping, standing, or parking",
   "Passenger loading anytime",
   "Short-term parking"
  ],
  "answer": 0,
  "explanation": "A red curb restricts stopping and parking."
 },
 {
  "id": "ca-044",
  "topic": "Parking",
  "chapter": "Turning and parking",
  "question": "What does a blue-painted curb designate?",
  "options": [
   "Parking for eligible disabled persons with proper placard or plates",
   "Free parking for everyone",
   "Commercial loading only"
  ],
  "answer": 0,
  "explanation": "Blue curb spaces require qualifying authorization."
 },
 {
  "id": "ca-045",
  "topic": "Parking",
  "chapter": "Turning and parking",
  "question": "What should you do before opening a door into traffic?",
  "options": [
   "Check for bicycles and vehicles",
   "Open immediately",
   "Honk and open"
  ],
  "answer": 0,
  "explanation": "Look for approaching road users before opening."
 },
 {
  "id": "ca-046",
  "topic": "Parking",
  "chapter": "Turning and parking",
  "question": "Why should you set the parking brake?",
  "options": [
   "To help prevent unintended rolling",
   "To improve fuel economy",
   "To turn on headlights"
  ],
  "answer": 0,
  "explanation": "Secure the parked vehicle."
 },
 {
  "id": "ca-047",
  "topic": "Sharing road",
  "chapter": "Sharing the road",
  "question": "How much space should you give a bicyclist when passing in California when possible?",
  "options": [
   "At least three feet",
   "One inch",
   "No space if you honk"
  ],
  "answer": 0,
  "explanation": "Allow at least three feet; follow current law when that clearance is unavailable."
 },
 {
  "id": "ca-048",
  "topic": "Sharing road",
  "chapter": "Sharing the road",
  "question": "Why check for motorcycles before changing lanes?",
  "options": [
   "They are smaller and easy to overlook",
   "They must always yield",
   "They cannot use freeways"
  ],
  "answer": 0,
  "explanation": "Look carefully for motorcycles in mirrors and blind spots."
 },
 {
  "id": "ca-049",
  "topic": "Sharing road",
  "chapter": "Sharing the road",
  "question": "What should you do near a large truck making a wide turn?",
  "options": [
   "Stay back and avoid squeezing alongside",
   "Drive into its turning space",
   "Pass on the inside"
  ],
  "answer": 0,
  "explanation": "Large trucks need extra room to turn."
 },
 {
  "id": "ca-050",
  "topic": "Sharing road",
  "chapter": "Sharing the road",
  "question": "When a school bus displays flashing red lights, what should drivers do?",
  "options": [
   "Stop as required by law",
   "Pass carefully without stopping",
   "Only slow down"
  ],
  "answer": 0,
  "explanation": "Follow California school-bus stopping rules and exceptions."
 },
 {
  "id": "ca-051",
  "topic": "Sharing road",
  "chapter": "Sharing the road",
  "question": "What should you do when approaching a pedestrian using a white cane?",
  "options": [
   "Yield and use extreme caution",
   "Honk repeatedly",
   "Expect them to hurry"
  ],
  "answer": 0,
  "explanation": "Protect pedestrians with visual impairments."
 },
 {
  "id": "ca-052",
  "topic": "Sharing road",
  "chapter": "Sharing the road",
  "question": "What is safer when following a motorcycle?",
  "options": [
   "Allow extra following distance",
   "Follow closer than a car",
   "Share the same lane"
  ],
  "answer": 0,
  "explanation": "Motorcycles can stop quickly and need a full lane."
 },
 {
  "id": "ca-053",
  "topic": "Sharing road",
  "chapter": "Sharing the road",
  "question": "When passing a horse and rider, what is appropriate?",
  "options": [
   "Slow down and allow plenty of space",
   "Honk loudly",
   "Accelerate beside them"
  ],
  "answer": 0,
  "explanation": "Animals can be startled by traffic."
 },
 {
  "id": "ca-054",
  "topic": "Safety",
  "chapter": "Safe driving",
  "question": "When should you wear a seat belt?",
  "options": [
   "On every trip",
   "Only on freeways",
   "Only in the front seat"
  ],
  "answer": 0,
  "explanation": "Seat belts reduce injury risk."
 },
 {
  "id": "ca-055",
  "topic": "Safety",
  "chapter": "Safe driving",
  "question": "What should you do with a handheld phone while driving?",
  "options": [
   "Do not use it while driving",
   "Text only at red lights",
   "Hold it below the steering wheel"
  ],
  "answer": 0,
  "explanation": "Avoid distracted driving and follow hands-free rules."
 },
 {
  "id": "ca-056",
  "topic": "Safety",
  "chapter": "Safe driving",
  "question": "What should you do if you feel sleepy while driving?",
  "options": [
   "Stop somewhere safe and rest",
   "Open a window and keep going indefinitely",
   "Drive faster"
  ],
  "answer": 0,
  "explanation": "Fatigue can impair driving; rest before continuing."
 },
 {
  "id": "ca-057",
  "topic": "Safety",
  "chapter": "Safe driving",
  "question": "Why should you leave a following gap?",
  "options": [
   "To allow time to react and stop",
   "To prevent cars merging",
   "To make passing easier"
  ],
  "answer": 0,
  "explanation": "A larger gap reduces rear-end collision risk."
 },
 {
  "id": "ca-058",
  "topic": "Safety",
  "chapter": "Safe driving",
  "question": "What should you do before backing up?",
  "options": [
   "Look behind and around the vehicle",
   "Rely only on a backup camera",
   "Reverse immediately"
  ],
  "answer": 0,
  "explanation": "Check surroundings, especially for children."
 },
 {
  "id": "ca-059",
  "topic": "Safety",
  "chapter": "Safe driving",
  "question": "How should you respond to aggressive drivers?",
  "options": [
   "Avoid confrontation and give space",
   "Race them",
   "Make threatening gestures"
  ],
  "answer": 0,
  "explanation": "Prioritize safety and avoid escalation."
 },
 {
  "id": "ca-060",
  "topic": "Safety",
  "chapter": "Safe driving",
  "question": "What should you do if your vehicle begins to skid?",
  "options": [
   "Ease off the accelerator and steer smoothly",
   "Brake and steer violently",
   "Accelerate sharply"
  ],
  "answer": 0,
  "explanation": "Avoid abrupt inputs and regain control gradually."
 },
 {
  "id": "ca-061",
  "topic": "Safety",
  "chapter": "Safe driving",
  "question": "Why should headlights be used in poor visibility?",
  "options": [
   "To see and be seen",
   "Only to signal anger",
   "To make the car faster"
  ],
  "answer": 0,
  "explanation": "Proper lights improve visibility."
 },
 {
  "id": "ca-062",
  "topic": "Alcohol and drugs",
  "chapter": "Alcohol and drugs",
  "question": "Can alcohol affect judgment before you feel drunk?",
  "options": [
   "Yes",
   "No",
   "Only after midnight"
  ],
  "answer": 0,
  "explanation": "Impairment can begin before obvious signs appear."
 },
 {
  "id": "ca-063",
  "topic": "Alcohol and drugs",
  "chapter": "Alcohol and drugs",
  "question": "What is the safest choice after drinking alcohol?",
  "options": [
   "Use a sober driver or another ride",
   "Drive slowly",
   "Drink coffee and drive"
  ],
  "answer": 0,
  "explanation": "Do not drive impaired."
 },
 {
  "id": "ca-064",
  "topic": "Alcohol and drugs",
  "chapter": "Alcohol and drugs",
  "question": "Can some prescription medicines affect driving?",
  "options": [
   "Yes, some cause impairment",
   "No, prescriptions are always safe",
   "Only if taken with food"
  ],
  "answer": 0,
  "explanation": "Read warnings and ask a clinician or pharmacist."
 },
 {
  "id": "ca-065",
  "topic": "Alcohol and drugs",
  "chapter": "Alcohol and drugs",
  "question": "Does marijuana affect driving ability?",
  "options": [
   "Yes, it can impair reaction and judgment",
   "No, it improves attention",
   "Only on freeways"
  ],
  "answer": 0,
  "explanation": "Never drive impaired by cannabis."
 },
 {
  "id": "ca-066",
  "topic": "Emergencies",
  "chapter": "Emergencies and collisions",
  "question": "If a tire blows out, what should you do first?",
  "options": [
   "Hold the steering wheel firmly and slow gradually",
   "Brake hard immediately",
   "Turn sharply"
  ],
  "answer": 0,
  "explanation": "Maintain control and pull off when safe."
 },
 {
  "id": "ca-067",
  "topic": "Emergencies",
  "chapter": "Emergencies and collisions",
  "question": "If your brakes fail, what should you do?",
  "options": [
   "Try to slow and move to a safe area",
   "Turn off the ignition while moving at speed",
   "Accelerate"
  ],
  "answer": 0,
  "explanation": "Use appropriate emergency stopping procedures."
 },
 {
  "id": "ca-068",
  "topic": "Emergencies",
  "chapter": "Emergencies and collisions",
  "question": "What should you do after a minor collision when vehicles can move safely?",
  "options": [
   "Move out of traffic if safe and exchange required information",
   "Leave without stopping",
   "Argue in traffic lanes"
  ],
  "answer": 0,
  "explanation": "Prevent additional crashes and follow reporting requirements."
 },
 {
  "id": "ca-069",
  "topic": "Emergencies",
  "chapter": "Emergencies and collisions",
  "question": "What should you do when approaching an incident with stopped emergency vehicles?",
  "options": [
   "Slow and move over when safe as required",
   "Speed past",
   "Stop to take photos"
  ],
  "answer": 0,
  "explanation": "Follow move-over and slow-down rules."
 },
 {
  "id": "ca-070",
  "topic": "Emergencies",
  "chapter": "Emergencies and collisions",
  "question": "If your vehicle stalls on a railroad crossing, what should you do?",
  "options": [
   "Get everyone out and away from the tracks",
   "Stay inside and restart indefinitely",
   "Walk along the tracks"
  ],
  "answer": 0,
  "explanation": "Move people to safety and call for help."
 },
 {
  "id": "ca-071",
  "topic": "Documents",
  "chapter": "Vehicle responsibilities",
  "question": "What must drivers carry when operating a vehicle?",
  "options": [
   "A valid driver license or permit as applicable",
   "A passport at all times",
   "A birth certificate"
  ],
  "answer": 0,
  "explanation": "Carry the legally required driving credential."
 },
 {
  "id": "ca-072",
  "topic": "Documents",
  "chapter": "Vehicle responsibilities",
  "question": "Why is vehicle liability insurance important?",
  "options": [
   "California requires financial responsibility",
   "It replaces registration",
   "It eliminates traffic fines"
  ],
  "answer": 0,
  "explanation": "Maintain required proof of financial responsibility."
 },
 {
  "id": "ca-073",
  "topic": "Documents",
  "chapter": "Vehicle responsibilities",
  "question": "What is the purpose of vehicle registration?",
  "options": [
   "It documents lawful vehicle registration",
   "It replaces a license",
   "It guarantees safe driving"
  ],
  "answer": 0,
  "explanation": "Keep registration current as required."
 },
 {
  "id": "ca-074",
  "topic": "Documents",
  "chapter": "Vehicle responsibilities",
  "question": "When moving, why should you update DMV address information?",
  "options": [
   "To keep required records current",
   "To raise speed limits",
   "To avoid wearing a seat belt"
  ],
  "answer": 0,
  "explanation": "Report address changes within the required timeframe."
 },
 {
  "id": "ca-075",
  "topic": "Documents",
  "chapter": "Vehicle responsibilities",
  "question": "What should you do if a law enforcement officer signals you to stop?",
  "options": [
   "Pull over safely and follow lawful instructions",
   "Speed away",
   "Stop abruptly in a live lane if avoidable"
  ],
  "answer": 0,
  "explanation": "Choose a safe stopping location and cooperate."
 }
 ,...adventureExtras.map(({id,topic,chapter,question,options,answer,explanation})=>({id,topic,chapter,question,options,answer,explanation}))
];
export const dmvTopics=Array.from(new Set(dmvQuestionBank.map(q=>q.topic)));
