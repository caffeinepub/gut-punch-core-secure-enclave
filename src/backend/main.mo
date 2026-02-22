import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import OutCall "http-outcalls/outcall";

import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";

actor {
  include MixinStorage();

  // Types
  public type UsageStats = {
    totalAppOpenCount : Nat;
    uniqueUserEstimate : Nat;
    recentAppOpenEvents : [Time.Time];
  };

  // App Market Integration Types
  public type MarketCategory = {
    #productivity;
    #finance;
    #education;
    #health;
    #entertainment;
    #utility;
    #business;
    #other;
  };

  public type PayoutCurrency = {
    #usdc;
    #btc;
    #icp;
  };

  public type MarketConfig = {
    priceUSD : Nat;
    description : Text;
    category : MarketCategory;
    walletPrincipal : ?Principal;
    payoutCurrency : PayoutCurrency;
    isPublished : Bool;
    totalRoyaltiesEarned : Nat;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Market config state
  var marketConfig : MarketConfig = {
    priceUSD = 0;
    description = "";
    category = #other;
    walletPrincipal = null;
    payoutCurrency = #usdc;
    isPublished = false;
    totalRoyaltiesEarned = 0;
  };

  // User Profile Management
  public type UserProfile = {
    name : Text;
    email : ?Text;
    stripeCustomerId : ?Text;
  };

  public type SubscriptionStatus = {
    #free;
    #proMonthly;
    #proAnnual;
  };

  public type SubscriptionUpdate = {
    status : SubscriptionStatus;
    stripeSubscriptionId : ?Text;
    expiresAt : ?Int;
  };

  public type UserUsageStats = {
    dailyScans : Nat;
    lastResetTime : Int;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userSubscriptions = Map.empty<Principal, SubscriptionUpdate>();
  let userUsageStats = Map.empty<Principal, UserUsageStats>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own information in secure state");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("You must be authenticated to update your profile");
    };
    userProfiles.add(caller, profile);
  };

  // Subscription Management
  public query ({ caller }) func getCallerSubscription() : async ?SubscriptionUpdate {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their subscription");
    };
    userSubscriptions.get(caller);
  };

  public shared ({ caller }) func updateCallerSubscription(subscription : SubscriptionUpdate) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update their subscription");
    };
    userSubscriptions.add(caller, subscription);
  };

  // Usage Stats and Free Tier Management
  public query ({ caller }) func getCallerUsageStats() : async ?UserUsageStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their usage stats");
    };
    userUsageStats.get(caller);
  };

  public shared ({ caller }) func incrementDailyScans() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can increment scans");
    };

    let now = Time.now();
    let oneDayNanos = 24 * 60 * 60 * 1_000_000_000;

    switch (userUsageStats.get(caller)) {
      case (null) {
        userUsageStats.add(
          caller,
          {
            dailyScans = 1;
            lastResetTime = now;
          },
        );
      };
      case (?stats) {
        // Check if we need to reset (more than 24 hours since last reset)
        if ((now - stats.lastResetTime : Int) >= oneDayNanos) {
          userUsageStats.add(
            caller,
            {
              dailyScans = 1;
              lastResetTime = now;
            },
          );
        } else {
          userUsageStats.add(
            caller,
            {
              dailyScans = stats.dailyScans + 1;
              lastResetTime = stats.lastResetTime;
            },
          );
        };
      };
    };
  };

  // Admin function to reset all free tier users at midnight
  public shared ({ caller }) func resetFreeTierUsage() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reset free tier usage");
    };

    let now = Time.now();
    for ((principal, subscription) in userSubscriptions.entries()) {
      switch (subscription.status) {
        case (#free) {
          userUsageStats.add(
            principal,
            {
              dailyScans = 0;
              lastResetTime = now;
            },
          );
        };
        case (_) {
          // Pro users don't need reset
        };
      };
    };
  };

  // Product Management
  public type Product = {
    id : Text;
    name : Text;
    priceId : Text;
    description : Text;
  };

  let products = Map.empty<Text, Product>();

  public query func getProducts() : async [Product] {
    products.values().toArray();
  };

  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("You do not have permission to add product items.");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("You do not have permission to update product items.");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func deleteProduct(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("You do not have permission to delete product items. ");
    };
    products.remove(productId);
  };

  // Stripe Integration
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("You need administrative permissions to update Stripe configuration");
    };
    stripeConfiguration := ?config;
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query func authenticateUser(authToken : Text) : async Bool {
    authToken.size() > 0;
  };

  // Usage Tracking
  var totalAppOpenCount = 0;
  let uniqueUserCheck = Map.empty<Principal, ()>();
  let usageEvents = List.empty<Time.Time>();

  public shared ({ caller }) func trackAppOpen() : async () {
    totalAppOpenCount += 1;

    if (caller.isAnonymous()) {
      return;
    };

    let isNewUser = not uniqueUserCheck.containsKey(caller);
    if (isNewUser) {
      uniqueUserCheck.add(caller, ());
    };

    let now = Time.now();
    usageEvents.add(now);

    let maxEvents = 500;
    let currentSize = usageEvents.size();
    if (currentSize > maxEvents) {
      let dropCount = currentSize - maxEvents;
      let dropped = usageEvents.values().drop(dropCount);
      usageEvents.clear();
      for (event in dropped) {
        usageEvents.add(event);
      };
    };
  };

  // Admin-only query to retrieve stats
  public shared ({ caller }) func getUsageStats() : async UsageStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only administrators can view usage statistics");
    };

    let currentTime = Time.now();
    let threshold = 365 * 24 * 60 * 60 * 1_000_000_000;

    // Filter events to keep only those from the last year
    let recentEvents = usageEvents.values().filter(
      func(event) { (currentTime - event : Int) < threshold }
    );

    let recentEventsArray = recentEvents.toArray();
    {
      totalAppOpenCount;
      uniqueUserEstimate = uniqueUserCheck.size();
      recentAppOpenEvents = recentEventsArray;
    };
  };

  // App Market Configuration Endpoints
  public query ({ caller }) func getMarketConfig() : async MarketConfig {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only administrators can view market settings in secure state");
    };
    marketConfig;
  };

  public shared ({ caller }) func updateMarketConfig(config : MarketConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("You do not have permission to update market settings");
    };
    marketConfig := config;
  };

  public shared ({ caller }) func publish() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("You do not have permission to publish to the market");
    };
    marketConfig := {
      marketConfig with
      isPublished = true
    };
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  // Punch Posts Management
  public type Punch = {
    id : Text;
    userId : Principal;
    content : Text;
    timestamp : Int;
    views : Nat;
    likes : Nat;
  };

  let punches = Map.empty<Text, Punch>();
  let punchLikes = Map.empty<Text, Map.Map<Principal, ()>>();

  public shared ({ caller }) func createPunch(content : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create punches");
    };

    let id = "punch_" # caller.toText() # "_" # Time.now().toText();
    let punch : Punch = {
      id;
      userId = caller;
      content;
      timestamp = Time.now();
      views = 0;
      likes = 0;
    };
    punches.add(id, punch);
    punchLikes.add(id, Map.empty<Principal, ()>());
    id;
  };

  public query func getPunch(id : Text) : async ?Punch {
    punches.get(id);
  };

  public query func getAllPunches() : async [Punch] {
    punches.values().toArray();
  };

  public shared ({ caller }) func incrementPunchViews(punchId : Text) : async () {
    switch (punches.get(punchId)) {
      case (null) {
        Runtime.trap("Punch not found");
      };
      case (?punch) {
        let updated = {
          punch with
          views = punch.views + 1
        };
        punches.add(punchId, updated);
      };
    };
  };

  public shared ({ caller }) func likePunch(punchId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can like punches");
    };

    switch (punches.get(punchId)) {
      case (null) {
        Runtime.trap("Punch not found");
      };
      case (?punch) {
        switch (punchLikes.get(punchId)) {
          case (null) {
            let likesMap = Map.empty<Principal, ()>();
            likesMap.add(caller, ());
            punchLikes.add(punchId, likesMap);
            let updated = {
              punch with
              likes = punch.likes + 1
            };
            punches.add(punchId, updated);
          };
          case (?likesMap) {
            if (not likesMap.containsKey(caller)) {
              likesMap.add(caller, ());
              let updated = {
                punch with
                likes = punch.likes + 1
              };
              punches.add(punchId, updated);
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func unlikePunch(punchId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can unlike punches");
    };

    switch (punches.get(punchId)) {
      case (null) {
        Runtime.trap("Punch not found");
      };
      case (?punch) {
        switch (punchLikes.get(punchId)) {
          case (null) {};
          case (?likesMap) {
            if (likesMap.containsKey(caller)) {
              likesMap.remove(caller);
              let updated = {
                punch with
                likes = if (punch.likes > 0) { punch.likes - 1 } else { 0 }
              };
              punches.add(punchId, updated);
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func deletePunch(punchId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete punches");
    };

    switch (punches.get(punchId)) {
      case (null) {
        Runtime.trap("Punch not found");
      };
      case (?punch) {
        if (punch.userId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own punches");
        };
        punches.remove(punchId);
        punchLikes.remove(punchId);
      };
    };
  };

  // Trending/Hot Punches Algorithm
  func comparePunches(a : Punch, b : Punch) : Order.Order {
    let aScore = a.views + (a.likes * 2);
    let bScore = b.views + (b.likes * 2);

    if (aScore > bScore) {
      #less;
    } else if (aScore < bScore) {
      #greater;
    } else {
      if (a.timestamp > b.timestamp) {
        #less;
      } else if (a.timestamp < b.timestamp) {
        #greater;
      } else {
        #equal;
      };
    };
  };

  public query func getTrendingPunches(limit : Nat) : async [Punch] {
    let allPunches = punches.values().toArray();
    let sorted = allPunches.sort(
      comparePunches
    );
    let takeLimit = Nat.min(limit, sorted.size());
    sorted.sliceToArray(0, takeLimit);
  };

  // Chat Messages Management
  public type ChatMessage = {
    id : Text;
    senderId : Principal;
    receiverId : Principal;
    content : Text;
    timestamp : Int;
    isRead : Bool;
  };

  let chatMessages = Map.empty<Text, ChatMessage>();
  let userOnlineStatus = Map.empty<Principal, Bool>();

  public shared ({ caller }) func sendMessage(receiverId : Principal, content : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can send messages");
    };

    let id = "msg_" # caller.toText() # "_" # Time.now().toText();
    let message : ChatMessage = {
      id;
      senderId = caller;
      receiverId;
      content;
      timestamp = Time.now();
      isRead = false;
    };
    chatMessages.add(id, message);
    id;
  };

  public query ({ caller }) func getConversation(otherUserId : Principal) : async [ChatMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view conversations");
    };

    let messages = chatMessages.values().filter(
      func(msg : ChatMessage) : Bool {
        (msg.senderId == caller and msg.receiverId == otherUserId) or (msg.senderId == otherUserId and msg.receiverId == caller)
      }
    );

    let messagesArray = messages.toArray();
    messagesArray.sort(
      func(a : ChatMessage, b : ChatMessage) : Order.Order {
        if (a.timestamp < b.timestamp) {
          #less;
        } else if (a.timestamp > b.timestamp) {
          #greater;
        } else {
          #equal;
        };
      }
    );
  };

  public shared ({ caller }) func markMessageAsRead(messageId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can mark messages as read");
    };

    switch (chatMessages.get(messageId)) {
      case (null) {
        Runtime.trap("Message not found");
      };
      case (?message) {
        if (message.receiverId != caller) {
          Runtime.trap("Unauthorized: Can only mark your own received messages as read");
        };
        let updated = {
          message with
          isRead = true
        };
        chatMessages.add(messageId, updated);
      };
    };
  };

  public shared ({ caller }) func setOnlineStatus(isOnline : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can set online status");
    };
    userOnlineStatus.add(caller, isOnline);
  };

  public query ({ caller }) func getOnlineStatus(userId : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view online status");
    };

    switch (userOnlineStatus.get(userId)) {
      case (null) { false };
      case (?status) { status };
    };
  };

  public query ({ caller }) func getUnreadMessageCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view unread message count");
    };

    let unreadMessages = chatMessages.values().filter(
      func(msg : ChatMessage) : Bool {
        msg.receiverId == caller and not msg.isRead
      }
    );

    unreadMessages.toArray().size();
  };

  // Therapist Pro Mode Enhancements
  public type TherapistSession = {
    id : Text;
    therapistId : Principal;
    clientId : Principal;
    notes : Text;
    resolutionTips : Text;
    timestamp : Int;
    isActive : Bool;
  };

  let therapistSessions = Map.empty<Text, TherapistSession>();

  public shared ({ caller }) func createTherapistSession(clientId : Principal, notes : Text, resolutionTips : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create therapist sessions");
    };

    let id = "session_" # caller.toText() # "_" # Time.now().toText();
    let session : TherapistSession = {
      id;
      therapistId = caller;
      clientId;
      notes;
      resolutionTips;
      timestamp = Time.now();
      isActive = true;
    };
    therapistSessions.add(id, session);
    id;
  };

  public query ({ caller }) func getTherapistSession(sessionId : Text) : async ?TherapistSession {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view therapist sessions");
    };

    switch (therapistSessions.get(sessionId)) {
      case (null) { null };
      case (?session) {
        // Only allow therapist, client, or admin to view
        if (
          session.therapistId == caller or session.clientId == caller or AccessControl.isAdmin(
            accessControlState,
            caller,
          )
        ) {
          ?session;
        } else {
          Runtime.trap("Unauthorized: Can only view your own sessions");
        };
      };
    };
  };

  public query ({ caller }) func getTherapistSessionsByClient(clientId : Principal) : async [TherapistSession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view therapist sessions");
    };

    // Only allow the client themselves or admins to view
    if (caller != clientId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own sessions");
    };

    let clientSessions = therapistSessions.values().filter(
      func(session) { session.clientId == clientId }
    );
    clientSessions.toArray();
  };

  public query ({ caller }) func getTherapistSessionByTherapist(therapistId : Principal) : async [TherapistSession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view therapist sessions");
    };

    // Only allow the therapist themselves or admins to view
    if (caller != therapistId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own sessions");
    };

    let therapistSessionsArray = therapistSessions.values().filter(
      func(session) { session.therapistId == therapistId }
    );
    therapistSessionsArray.toArray();
  };

  public shared ({ caller }) func updateTherapistSession(sessionId : Text, notes : Text, resolutionTips : Text, isActive : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update therapist sessions");
    };

    switch (therapistSessions.get(sessionId)) {
      case (null) {
        Runtime.trap("Session not found");
      };
      case (?session) {
        // Verify caller is the therapist who created the session
        if (session.therapistId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own sessions");
        };
        let updated = {
          session with
          notes;
          resolutionTips;
          isActive;
        };
        therapistSessions.add(sessionId, updated);
      };
    };
  };

  public shared ({ caller }) func endTherapistSession(sessionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can end therapist sessions");
    };

    switch (therapistSessions.get(sessionId)) {
      case (null) {
        Runtime.trap("Session not found");
      };
      case (?session) {
        // Verify caller is the therapist who created the session
        if (session.therapistId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only end your own sessions");
        };
        let updated = {
          session with
          isActive = false
        };
        therapistSessions.add(sessionId, updated);
      };
    };
  };

  public shared ({ caller }) func deleteTherapistSession(sessionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete therapist sessions");
    };

    switch (therapistSessions.get(sessionId)) {
      case (null) {
        Runtime.trap("Session not found");
      };
      case (?session) {
        // Verify caller is the therapist who created the session
        if (session.therapistId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own sessions");
        };
        therapistSessions.remove(sessionId);
      };
    };
  };
};
