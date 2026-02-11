import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PropertyForm } from "./PropertyForm";

describe("PropertyForm", () => {
  it("blocks submit and shows validation errors when required fields are missing", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<PropertyForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Create Property" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findByText("Address is required")).toBeInTheDocument();
    expect(screen.getByText("City is required")).toBeInTheDocument();
    expect(screen.getByText("State is required")).toBeInTheDocument();
    expect(screen.getByText("ZIP must be 5 digits")).toBeInTheDocument();
    expect(screen.getByText("Square footage is required")).toBeInTheDocument();
    expect(screen.getByText("Price is required")).toBeInTheDocument();
    expect(screen.getByText("Property type is required")).toBeInTheDocument();
    expect(screen.getByText("Add at least one key feature")).toBeInTheDocument();
  });

  it("submits a normalized CreatePropertyInput payload for valid minimal input", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<PropertyForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText("123 Main Street"), " 123 Main Street ");
    await user.type(screen.getByPlaceholderText("Austin"), " Austin ");
    const [stateSelect, propertyTypeSelect] = screen.getAllByRole("combobox");
    await user.selectOptions(stateSelect, "TX");
    await user.type(screen.getByPlaceholderText("78701"), "78701");
    await user.clear(screen.getByPlaceholderText("2,400"));
    await user.type(screen.getByPlaceholderText("2,400"), "2400");
    await user.type(screen.getByPlaceholderText("450,000"), "450000");
    await user.selectOptions(propertyTypeSelect, "single_family");

    const keyFeatureInput = screen.getByPlaceholderText("Type a feature and press Enter");
    await user.type(keyFeatureInput, "Open floor plan{enter}");

    await user.type(screen.getByPlaceholderText("2020"), "2019");
    await user.type(screen.getByPlaceholderText("0.25 acres"), " 0.30 acres ");
    await user.type(screen.getByPlaceholderText("2-car garage"), " Attached garage ");
    await user.type(
      screen.getByPlaceholderText("Downtown"),
      " Central District "
    );
    await user.type(screen.getByPlaceholderText("Austin ISD"), " AISD ");
    await user.type(
      screen.getByPlaceholderText(
        "Private notes about this property (not included in generated content)..."
      ),
      "  Seller flexible on closing date.  "
    );

    await user.click(screen.getByRole("button", { name: "Create Property" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

    expect(onSubmit).toHaveBeenCalledWith({
      address: "123 Main Street",
      city: "Austin",
      state: "TX",
      zip: "78701",
      beds: 3,
      baths: 2,
      sqft: 2400,
      price: 45000000,
      propertyType: "single_family",
      yearBuilt: 2019,
      lotSize: "0.30 acres",
      parking: "Attached garage",
      keyFeatures: ["Open floor plan"],
      neighborhood: "Central District",
      neighborhoodHighlights: [],
      schoolDistrict: "AISD",
      nearbyAmenities: [],
      agentNotes: "Seller flexible on closing date.",
    });
  });
});
