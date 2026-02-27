import Map "mo:core/Map";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type ListingType = {
    #marketplace;
    #service;
  };

  type FileMetadata = {
    filename : Text;
    mimeType : Text;
    size : Nat;
    fileBlob : Storage.ExternalBlob;
  };

  type NotificationEvent = {
    listingType : ListingType;
    listingId : Text;
    listingTitle : Text;
    timestamp : Int;
  };

  type Notification = {
    listingType : ListingType;
    listingTitle : Text;
    listingId : Text;
    message : Text;
    timestamp : Int;
  };

  type MarketplaceListing = {
    id : Text;
    listingId : Text;
    photo : FileMetadata;
    title : Text;
    price : Nat;
    subject : Text;
    classYear : Text;
    sellerName : Text;
    sellerWhatsapp : Text;
    active : Bool;
    createdBy : Principal;
    sold : Bool;
    buyerPrincipal : ?Principal;
  };

  type ServiceListing = {
    id : Text;
    listingId : Text;
    serviceDescription : Text;
    category : Text;
    helperName : Text;
    helperWhatsapp : Text;
    active : Bool;
    createdBy : Principal;
  };

  type UserProfile = {
    displayName : Text;
    whatsappNumber : Text;
    bio : Text;
  };

  type ListingRating = {
    listingId : Text;
    rating : Nat8;
    comment : ?Text;
    reviewer : Principal;
    timestamp : Int;
  };

  type ListingUpdate = {
    title : Text;
    price : Nat;
    subject : Text;
    classYear : Text;
    photo : FileMetadata;
    sellerName : Text;
    sellerWhatsapp : Text;
  };

  type MeetupIntent = {
    listingId : Text;
    buyerPrincipal : Principal;
    sellerPrincipal : Principal;
    meetupNote : Text;
    createdAt : Int;
    sellerConfirmed : Bool;
    buyerConfirmed : Bool;
    exchangeConfirmed : Bool;
  };

  type Paper = {
    id : Text;
    title : Text;
    subject : Text;
    year : Nat;
    uploadedBy : Principal;
    uploadedAt : Int;
    description : Text;
    fileMetadata : FileMetadata;
  };

  type UploadError = {
    #actorUnavailable : Text;
    #fileTooLarge : Text;
    #internalError : Text;
    #callerNotAuthenticated : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let userProfiles = Map.empty<Principal, UserProfile>();
  let marketplaceListings = Map.empty<Text, MarketplaceListing>();
  let serviceListings = Map.empty<Text, ServiceListing>();
  let marketplaceRatings = Map.empty<Text, List.List<ListingRating>>();
  let notificationEvents = List.empty<NotificationEvent>();
  let lastSeenNotifications = Map.empty<Principal, Int>();

  let meetupIntents = Map.empty<Text, MeetupIntent>();
  let papers = Map.empty<Text, Paper>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updateMyProfile(displayName : Text, whatsappNumber : Text, bio : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update their profile");
    };
    let updatedProfile = {
      displayName;
      whatsappNumber;
      bio;
    };
    userProfiles.add(caller, updatedProfile);
  };

  public query ({ caller }) func getMyListings() : async {
    marketplace : [MarketplaceListing];
    services : [ServiceListing];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their listings");
    };
    let myMarketplaceListings = marketplaceListings.values().toArray().filter(
      func(listing) {
        listing.createdBy == caller
      }
    );
    let myServiceListings = serviceListings.values().toArray().filter(
      func(listing) {
        listing.createdBy == caller
      }
    );
    {
      marketplace = myMarketplaceListings;
      services = myServiceListings;
    };
  };

  public shared ({ caller }) func createMarketplaceListing(title : Text, price : Nat, subject : Text, classYear : Text, photo : FileMetadata, sellerName : Text, sellerWhatsapp : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create marketplace listings");
    };
    let newListing = {
      id = "";
      listingId = title;
      photo;
      title;
      price;
      subject;
      classYear;
      sellerName;
      sellerWhatsapp;
      active = true;
      createdBy = caller;
      sold = false;
      buyerPrincipal = null;
    };
    marketplaceListings.add(title, newListing);
    let notificationEvent : NotificationEvent = {
      listingType = #marketplace;
      listingId = title;
      listingTitle = title;
      timestamp = Time.now();
    };
    notificationEvents.add(notificationEvent);
  };

  public shared ({ caller }) func updateMarketplaceListing(listingId : Text, updateData : ListingUpdate) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update marketplace listings");
    };
    let listing = switch (marketplaceListings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) {
        if (caller != l.createdBy and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You are not the owner of this listing");
        };
        l;
      };
    };
    let updatedListing = {
      listing with
      title = updateData.title;
      price = updateData.price;
      subject = updateData.subject;
      classYear = updateData.classYear;
      photo = updateData.photo;
      sellerName = updateData.sellerName;
      sellerWhatsapp = updateData.sellerWhatsapp;
    };
    marketplaceListings.add(listingId, updatedListing);
  };

  public shared ({ caller }) func softDeleteMarketplaceListing(listingId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete marketplace listings");
    };
    let listing = switch (marketplaceListings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) { l };
    };
    if (caller != listing.createdBy and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You are not the owner of this listing");
    };
    let updatedListing = { listing with active = false };
    marketplaceListings.add(listingId, updatedListing);
  };

  public query func getActiveMarketplaceListings() : async [MarketplaceListing] {
    marketplaceListings.values().toArray().filter(
      func(listing) : Bool { listing.active }
    );
  };

  public query func getMarketplaceListingById(listingId : Text) : async ?MarketplaceListing {
    marketplaceListings.get(listingId);
  };

  public query ({ caller }) func getAllMarketplaceListingsAdmin() : async [MarketplaceListing] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can access all marketplace listings");
    };
    marketplaceListings.values().toArray();
  };

  public shared ({ caller }) func createServiceListing(serviceDescription : Text, category : Text, helperName : Text, helperWhatsapp : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create service listings");
    };
    let newListing = {
      id = "";
      listingId = serviceDescription;
      serviceDescription;
      category;
      helperName;
      helperWhatsapp;
      active = true;
      createdBy = caller;
    };
    serviceListings.add(serviceDescription, newListing);
    let notificationEvent : NotificationEvent = {
      listingType = #service;
      listingId = serviceDescription;
      listingTitle = helperName;
      timestamp = Time.now();
    };
    notificationEvents.add(notificationEvent);
  };

  public shared ({ caller }) func updateServiceListing(listingId : Text, updateData : {
    serviceDescription : Text;
    category : Text;
    helperName : Text;
    helperWhatsapp : Text;
  }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update service listings");
    };
    let listing = switch (serviceListings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) {
        if (caller != l.createdBy and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You are not the owner of this listing");
        };
        l;
      };
    };
    let updatedListing = {
      listing with
      serviceDescription = updateData.serviceDescription;
      category = updateData.category;
      helperName = updateData.helperName;
      helperWhatsapp = updateData.helperWhatsapp;
    };
    serviceListings.add(listingId, updatedListing);
  };

  public shared ({ caller }) func softDeleteServiceListing(listingId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete service listings");
    };
    let listing = switch (serviceListings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) { l };
    };
    if (caller != listing.createdBy and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You are not the owner of this listing");
    };
    let updatedListing = { listing with active = false };
    serviceListings.add(listingId, updatedListing);
  };

  public query func getActiveServiceListings() : async [ServiceListing] {
    serviceListings.values().toArray().filter(
      func(listing) : Bool { listing.active }
    );
  };

  public query func getServiceListingById(listingId : Text) : async ?ServiceListing {
    serviceListings.get(listingId);
  };

  public query ({ caller }) func getAllServiceListingsAdmin() : async [ServiceListing] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can access all service listings");
    };
    serviceListings.values().toArray();
  };

  public shared ({ caller }) func createRating(listingId : Text, rating : Nat8, comment : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create ratings");
    };
    if (rating < 1 or rating > 5) {
      Runtime.trap("Invalid rating value. Must be between 1 and 5");
    };
    let newRating : ListingRating = {
      listingId;
      rating;
      comment;
      reviewer = caller;
      timestamp = Time.now();
    };
    let existingRatings = switch (marketplaceRatings.get(listingId)) {
      case (null) { List.empty<ListingRating>() };
      case (?l) { l };
    };
    existingRatings.add(newRating);
    marketplaceRatings.add(listingId, existingRatings);
  };

  public query func getListingRatingSummary(listingId : Text) : async (Float, Nat) {
    let ratings = switch (marketplaceRatings.get(listingId)) {
      case (null) { List.empty<ListingRating>() };
      case (?l) { l };
    };
    let ratingsArray = ratings.toArray();
    if (ratingsArray.size() == 0) {
      return (0.0, 0);
    };
    let ratingsNats = ratingsArray.map(
      func(rating) {
        rating.rating.toNat();
      }
    );

    let total = ratingsNats.foldLeft(
      0,
      func(acc, rating) { acc + rating },
    );
    let count = ratingsArray.size();
    let average = total / count;
    (average.toFloat(), count);
  };

  public query func getRecentNotifications() : async [Notification] {
    let recentEvents = notificationEvents.toArray();
    let limitedEvents = if (recentEvents.size() > 20) {
      recentEvents.sliceToArray(0, 20);
    } else {
      recentEvents;
    };
    limitedEvents.map(func(event) { toNotification(event) });
  };

  func toNotification(event : NotificationEvent) : Notification {
    let message = switch (event.listingType) {
      case (#marketplace) { "New marketplace listing: " # event.listingTitle };
      case (#service) { "New service listing: " # event.listingTitle };
    };
    {
      listingType = event.listingType;
      listingTitle = event.listingTitle;
      listingId = event.listingId;
      message;
      timestamp = event.timestamp;
    };
  };

  public shared ({ caller }) func markNotificationsRead(upTo : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };
    lastSeenNotifications.add(caller, upTo);
  };

  public shared ({ caller }) func markAsPurchased(listingId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can purchase listings");
    };
    let listing = switch (marketplaceListings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) { l };
    };
    if (listing.sold) {
      Runtime.trap("Listing is already marked as sold");
    };
    if (caller == listing.createdBy) {
      Runtime.trap("Unauthorized: The seller cannot purchase their own listing");
    };
    let updatedListing = {
      listing with
      sold = true;
      buyerPrincipal = ?caller;
    };
    marketplaceListings.add(listingId, updatedListing);
  };

  public shared ({ caller }) func resetPurchaseStatus(listingId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reset purchase status");
    };
    let listing = switch (marketplaceListings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) { l };
    };
    if (caller != listing.createdBy and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the listing owner or an admin may reset purchase status");
    };
    let updatedListing = {
      listing with
      sold = false;
      buyerPrincipal = null;
    };
    marketplaceListings.add(listingId, updatedListing);
  };

  public shared ({ caller }) func createMeetup(listingId : Text, meetupNote : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create meetup intents");
    };
    let listing = switch (marketplaceListings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) { l };
    };
    switch (listing.buyerPrincipal) {
      case (null) { Runtime.trap("Listing must be purchased before creating a meetup") };
      case (?buyer) {
        if (buyer != caller) {
          Runtime.trap("Unauthorized: Only the buyer can create a meetup intent");
        };
        let newIntent = {
          listingId;
          buyerPrincipal = buyer;
          sellerPrincipal = listing.createdBy;
          meetupNote;
          createdAt = Time.now();
          sellerConfirmed = false;
          buyerConfirmed = false;
          exchangeConfirmed = false;
        };
        meetupIntents.add(listingId, newIntent);
      };
    };
  };

  public shared ({ caller }) func confirmExchange(listingId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can confirm exchanges");
    };
    let intent = switch (meetupIntents.get(listingId)) {
      case (null) { Runtime.trap("Meetup intent not found") };
      case (?i) { i };
    };
    let updatedIntent = if (caller == intent.buyerPrincipal) {
      {
        intent with
        buyerConfirmed = true;
        exchangeConfirmed = intent.sellerConfirmed and true;
      };
    } else if (caller == intent.sellerPrincipal) {
      {
        intent with
        sellerConfirmed = true;
        exchangeConfirmed = true and intent.buyerConfirmed;
      };
    } else {
      Runtime.trap("Unauthorized: Only the buyer or seller can confirm the exchange");
    };
    meetupIntents.add(listingId, updatedIntent);
  };

  public query ({ caller }) func getMeetupStatus(listingId : Text) : async {
    meetupNote : Text;
    sellerConfirmed : Bool;
    buyerConfirmed : Bool;
    exchangeConfirmed : Bool;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view meetup status");
    };
    let intent = switch (meetupIntents.get(listingId)) {
      case (null) { Runtime.trap("Meetup intent not found") };
      case (?i) { i };
    };
    if (
      caller != intent.buyerPrincipal and
      caller != intent.sellerPrincipal and
      not AccessControl.isAdmin(accessControlState, caller)
    ) {
      Runtime.trap("Unauthorized: Only the buyer, seller, or an admin can view meetup status");
    };
    {
      meetupNote = intent.meetupNote;
      sellerConfirmed = intent.sellerConfirmed;
      buyerConfirmed = intent.buyerConfirmed;
      exchangeConfirmed = intent.exchangeConfirmed;
    };
  };

  public shared ({ caller }) func uploadPaper(
    id : Text,
    title : Text,
    subject : Text,
    year : Nat,
    description : Text,
    fileMetadata : FileMetadata,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload papers");
    };
    let newPaper : Paper = {
      id;
      title;
      subject;
      year;
      uploadedBy = caller;
      uploadedAt = Time.now();
      description;
      fileMetadata;
    };
    papers.add(id, newPaper);
  };

  public query func getPapers() : async [Paper] {
    papers.values().toArray();
  };

  public query func getPaper(id : Text) : async ?Paper {
    papers.get(id);
  };

  public shared ({ caller }) func deletePaper(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete papers");
    };
    let paper = switch (papers.get(id)) {
      case (null) { Runtime.trap("Paper not found") };
      case (?p) { p };
    };
    if (
      not AccessControl.isAdmin(accessControlState, caller) and
      caller != paper.uploadedBy
    ) {
      Runtime.trap("Unauthorized: Only the uploader or an admin may delete this paper");
    };
    papers.remove(id);
  };

  // Handle file upload in one go
  public shared ({ caller }) func uploadFile(
    filename : Text,
    mimeType : Text,
    size : Nat,
    blob : Storage.ExternalBlob,
  ) : async {
    #ok : FileMetadata;
    #err : UploadError;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err(#callerNotAuthenticated("Unauthorized: Only users can upload files"));
    };
    await* uploadFileInternal(caller, filename, mimeType, size, blob, null);
  };

  func uploadFileInternal(
    _caller : Principal,
    filename : Text,
    mimeType : Text,
    size : Nat,
    blob : Storage.ExternalBlob,
    _chunked : ?{
      chunkSize : Nat;
      chunkCount : Nat;
      totalBytes : Int;
    },
  ) : async* {
    #ok : FileMetadata;
    #err : UploadError;
  } {
    let maxSize = 10_000_000_000;
    let fileSize = size;

    if (fileSize > maxSize) {
      return #err(#fileTooLarge("File exceeds 10GB upload limit"));
    };

    #ok({
      filename;
      mimeType;
      size = fileSize;
      fileBlob = blob;
    });
  };
};
