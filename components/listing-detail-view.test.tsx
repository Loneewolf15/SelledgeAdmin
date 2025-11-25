import { render, screen } from "@testing-library/react";
import { ListingDetailView } from "./listing-detail-view";

describe("ListingDetailView", () => {
  const mockListing = {
    id: "1",
    title: "Test Listing",
    description: "Test Description",
    price: 1000,
    location: "Test Location",
    status: "pending" as const,
    createdAt: new Date().toISOString(),
    ownerId: "1",
    ownerName: "Test Owner",
    ownerEmail: "test@example.com",
    images: [],
    propertyType: "rent",
    bedrooms: 2,
    bathrooms: 1,
    area: 100,
  };

  it("should display the agency fee if it is available", () => {
    const listingWithFee = {
      ...mockListing,
      agency_fee_percentage: 5,
    };
    render(
      <ListingDetailView
        listing={listingWithFee}
        onBack={() => {}}
        onApprove={() => {}}
        onReject={() => {}}
      />
    );
    expect(screen.getByText("Agency Fee:")).toBeInTheDocument();
    expect(screen.getByText("5%")).toBeInTheDocument();
  });

  it("should not display the agency fee if it is not available", () => {
    render(
      <ListingDetailView
        listing={mockListing}
        onBack={() => {}}
        onApprove={() => {}}
        onReject={() => {}}
      />
    );
    expect(screen.queryByText("Agency Fee:")).not.toBeInTheDocument();
  });
});
