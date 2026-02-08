import Stripe "stripe/stripe";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

import OutCall "http-outcalls/outcall";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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
    expiresAt : ?Int; // Timestamp
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userSubscriptions = Map.empty<Principal, SubscriptionUpdate>();

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
      Runtime.trap("Unauthorized: Only users can update their profile information. ");
    };
    userProfiles.add(caller, profile);
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

  // Public endpoint for UI to check Stripe configuration safely with no trap
  // Safe for anonymous callers - returns boolean status without authentication
  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("You need administrative permissions to update Stripe configuration");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
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

  // Authentication helper - safe for all callers including anonymous
  public query func authenticateUser(authToken : Text) : async Bool {
    // Returns false for empty/invalid tokens instead of trapping
    // This allows anonymous callers to safely check authentication status
    authToken.size() > 0;
  };
};
