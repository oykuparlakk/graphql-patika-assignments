const { ApolloServer, gql } = require("apollo-server");
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require("apollo-server-core");
const { v4: uuidv4 } = require('uuid');


const { events, users, participants, locations } = require("./data.json");

const typeDefs = `#graphql

  #User
  type User {
    id: ID
    username: String
    email: String
  }

  input createUserInput {
    username: String
    email: String
  }

  input updateUserInput {
    username: String
    email: String
  }

  # Event
  type Event {
    id: ID
    title: String
    desc: String
    date: String
    from: String
    to: String
    location_id: Int
    user_id: Int
    user: User
    participant: Participant
    location: Location
  }

  input createEventInput {
    title: String
    desc: String   
  }

  input updateEventInput {
    title: String
    desc: String
  }

  # Participant
  type Participant {
    id : ID
    user_id: ID
    event_id: ID
  }

  input createPartInput {
    user_id: ID
  }

  input updatePartInput {
    event_id: ID
  }
  
  # Location
  type Location {
    id: ID
    name: String
    desc: String
  }

  input createLocationInput {
    name: String
    desc: String
  }

  input updateLocationInput {
    name: String
    desc: String
  }

  type allDeleted {
    count: Int
  }
  
  type Query {
    users: [User]
    user(id:ID) : User

    events: [Event]
    event(id: ID) : Event

    participants: [Participant]
    participant(id: ID): Participant

    locations: [Location]
    location(id: ID): Location
  }

  type Mutation {
    createUser( data: createUserInput  ): User
    updateUser (id: ID, data : updateUserInput ): User
    deleteUser(id: ID, username: String): User
    deleteAllUsers: allDeleted

    createEvent(data: createEventInput): Event
    updateEvent(id: ID, data: updateEventInput): Event
    deleteEvent(id: ID, title: String): Event
    deleteAllEvents: allDeleted

    createLocation( data: createLocationInput ): Location
    updateLocation(id: ID, data: updateLocationInput): Location
    deleteLocation(id: ID, name: String): Location
    deleteAllLocations: allDeleted

    createPart( data: createPartInput   ): Participant
    updatePart( user_id: ID, data: updatePartInput ): Participant
    deletePart(user_id: ID, event_id: ID ): Participant
    deleteAllParts: allDeleted 
  }
`;

const resolvers = {
    Query: {
     
      users: () => users,
      user: (parent, args) => {
        const user = users.find( ( user ) => user.id == args.id );
        if (!user) {return new Error("Data Not Found!")};
        return user;
      },


      events: () => events,
      event: (parent, args) => {
        const event = events.find( ( event ) => event.id == args.id );
        if (!event) {return new Error("Data Not Found!")};
        return event;

      },

      participants: () => participants,
      participant: (parent, args) => {
        const participant = participants.find( ( participant ) => participant.id == args.id );
        if (!participant) {return new Error("Data Not Found!")};
        return participant;
      },

      locations: () => locations,
      location: (parent, args) => {
        const location = locations.find( ( location ) => location.id == args.id );
        if (!location) {return new Error("Data Not Found!")};
        return location;
      }
    },

    Event: {
        user: (parent) => users.find( ( user ) => user.id == parent.user_id ),
        participant: (parent) => participants.find( ( participant ) => participant.user_id == parent.user_id  ),
        location: (parent) => locations.find( ( location ) => location.id == parent.user_id )
    },


    Mutation: {
      createUser: (parent, {data}) => {
        const user = {id: uuidv4(), ...data};
        users.push(user);
        return user
      },

      updateUser: (parent, {id, data}) => {
        const userIndex = users.findIndex( ( user ) => user.id == id );
        if (userIndex == -1) { return new Error("Data not found!") };
        const newUpdatedUser = users[userIndex] = { ...users[userIndex], ...data };
        return newUpdatedUser;
      },

      deleteUser: (parent, {id, username}) => {
        const userIndex = users.findIndex( ( user ) => user.id == id || user.username == username );
        if (userIndex == -1) { return new Error("Data not found!") };
        const deletedUser = users[userIndex];
        users.splice(userIndex, 1);
        return deletedUser;
      },

      deleteAllUsers: () => {
        const length = users.length;
        users.splice(0, length);
        return { count: length };
      },
     
     // Event
      createEvent:(parent, {data}) => {
        const event = { id: uuidv4(),  ...data };
        events.push(event);
        return event;
      },

      updateEvent: (parent, {id, data}) => {
        const eventIndex = events.findIndex( ( event ) => event.id == id );
        if (eventIndex == -1) { return new Error("Data not found!") };
        const newUpdatedEvent = events[eventIndex] = { ...events[eventIndex], ...data };
        return newUpdatedEvent;
      },
      
      deleteEvent: (parent, {id, title}) => {
        const eventIndex = events.findIndex( ( event ) => event.id == id || event.title == title  );
        if (eventIndex == -1) { return new Error("Data not found!") };
        const deletedEvent = events[eventIndex];
        events.splice(eventIndex, 1);
        return deletedEvent;
      },

      deleteAllEvents: () => {
        const length = events.length;
        events.splice(0, length);
        return {
          count: length
        }
      },

      // Location
      createLocation: (parent, {data}) => {
        const location = {id: uuidv4(), ...data};
        locations.push(location);
        return location;
      },

      updateLocation: (parent, {id, data}) => {
        const locationIndex = locations.findIndex( ( location ) => location.id == id );
        if (locationIndex == -1) { return new Error("Data not found!") };
        const newUpdatedLocation = locations[locationIndex] = { ...locations[locationIndex], ...data };
        return newUpdatedLocation;
      },

      deleteLocation: (parent, {id, name}) => {
        const locationIndex = locations.findIndex(( location ) => location.id == id || location.name == name );
        if (locationIndex == -1) { return new Error("Data not found!") };
        const deletedLocation = locations[locationIndex];
        locations.splice(locationIndex, 1);
        return deletedLocation;
      },

      deleteAllLocations: () => {
        const length = locations.length;
        locations.splice(0, length);
        return { count: length };
      },


      //Participants
      createPart: (parent, {data}) => {
        const part = { id: uuidv4(), ...data, event_id: uuidv4() };
        participants.push(part);
        return part;
      },

      
      updatePart: ( parent,{ user_id, data } ) => {
        const partIndex = participants.findIndex( ( participant ) => participant.user_id == user_id  );
        if (partIndex == -1) { return new Error("Data not found!") };
        const newUpdatedPart = participants[partIndex] = { ...participants[partIndex], ...data };
        return newUpdatedPart;
      },

      deletePart: (parent, {id, user_id, event_id}) => {
        const partIndex = participants.findIndex( ( participant ) => 
        participant.user_id == user_id || participant.event_id == event_id 
        );
        if ( partIndex == -1 ) { return new Error("Data not found!") };
        const newDeletedPart = participants[partIndex];
        participants.splice(partIndex, 1);
        return newDeletedPart;
        },

        deleteAllParts: () => {
          const length = participants.length;
          participants.splice(0, length)
          return { count: length };
        }

    },
  };

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground({
    }),
  ],
});

server.listen().then(({ url }) => {
  console.log(`Apollo server is up 🚀`);
});