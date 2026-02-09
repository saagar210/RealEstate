import { useState, useCallback, type FormEvent, type KeyboardEvent } from "react";
import { Plus, Minus, X } from "lucide-react";
import { US_STATES, PROPERTY_TYPES } from "@/lib/constants";
import type { CreatePropertyInput, PropertyType } from "@/lib/types";

interface PropertyFormProps {
  initialValues?: CreatePropertyInput;
  onSubmit: (input: CreatePropertyInput) => Promise<void>;
  submitLabel?: string;
}

interface FormValues {
  address: string;
  city: string;
  state: string;
  zip: string;
  beds: number;
  baths: number;
  sqft: string;
  priceDisplay: string; // dollars string for display
  propertyType: PropertyType | "";
  yearBuilt: string;
  lotSize: string;
  parking: string;
  keyFeatures: string[];
  neighborhood: string;
  neighborhoodHighlights: string[];
  schoolDistrict: string;
  nearbyAmenities: string[];
  agentNotes: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(0);
}

function dollarsStringToCents(dollars: string): number {
  const cleaned = dollars.replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

function formatDollarsDisplay(raw: string): string {
  const cleaned = raw.replace(/[^0-9]/g, "");
  if (!cleaned) return "";
  return Number(cleaned).toLocaleString("en-US");
}

function buildInitial(init?: CreatePropertyInput): FormValues {
  if (!init) {
    return {
      address: "",
      city: "",
      state: "",
      zip: "",
      beds: 3,
      baths: 2,
      sqft: "",
      priceDisplay: "",
      propertyType: "",
      yearBuilt: "",
      lotSize: "",
      parking: "",
      keyFeatures: [],
      neighborhood: "",
      neighborhoodHighlights: [],
      schoolDistrict: "",
      nearbyAmenities: [],
      agentNotes: "",
    };
  }
  return {
    address: init.address,
    city: init.city,
    state: init.state,
    zip: init.zip,
    beds: init.beds,
    baths: init.baths,
    sqft: init.sqft.toString(),
    priceDisplay: formatDollarsDisplay(centsToDollars(init.price)),
    propertyType: init.propertyType,
    yearBuilt: init.yearBuilt?.toString() ?? "",
    lotSize: init.lotSize ?? "",
    parking: init.parking ?? "",
    keyFeatures: [...init.keyFeatures],
    neighborhood: init.neighborhood ?? "",
    neighborhoodHighlights: [...init.neighborhoodHighlights],
    schoolDistrict: init.schoolDistrict ?? "",
    nearbyAmenities: [...init.nearbyAmenities],
    agentNotes: init.agentNotes ?? "",
  };
}

function validate(v: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!v.address.trim()) errors.address = "Address is required";
  if (!v.city.trim()) errors.city = "City is required";
  if (!v.state) errors.state = "State is required";
  if (!/^\d{5}$/.test(v.zip)) errors.zip = "ZIP must be 5 digits";
  if (v.beds < 0) errors.beds = "Beds must be 0 or more";
  if (v.baths < 0) errors.baths = "Baths must be 0 or more";
  const sqftNum = parseInt(v.sqft, 10);
  if (!v.sqft.trim() || isNaN(sqftNum) || sqftNum <= 0)
    errors.sqft = "Square footage is required";
  const cents = dollarsStringToCents(v.priceDisplay);
  if (cents <= 0) errors.priceDisplay = "Price is required";
  if (!v.propertyType) errors.propertyType = "Property type is required";
  if (v.keyFeatures.length < 1)
    errors.keyFeatures = "Add at least one key feature";
  return errors;
}

export function PropertyForm({
  initialValues,
  onSubmit,
  submitLabel = "Create Property",
}: PropertyFormProps) {
  const [values, setValues] = useState<FormValues>(() =>
    buildInitial(initialValues)
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tag input states
  const [featureInput, setFeatureInput] = useState("");
  const [highlightInput, setHighlightInput] = useState("");
  const [amenityInput, setAmenityInput] = useState("");

  const set = useCallback(
    <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        if (prev[key]) {
          const next = { ...prev };
          delete next[key];
          return next;
        }
        return prev;
      });
    },
    []
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fieldErrors = validate(values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      const input: CreatePropertyInput = {
        address: values.address.trim(),
        city: values.city.trim(),
        state: values.state,
        zip: values.zip,
        beds: values.beds,
        baths: values.baths,
        sqft: parseInt(values.sqft, 10),
        price: dollarsStringToCents(values.priceDisplay),
        propertyType: values.propertyType as PropertyType,
        yearBuilt: values.yearBuilt ? parseInt(values.yearBuilt, 10) : null,
        lotSize: values.lotSize.trim() || null,
        parking: values.parking.trim() || null,
        keyFeatures: values.keyFeatures,
        neighborhood: values.neighborhood.trim() || null,
        neighborhoodHighlights: values.neighborhoodHighlights,
        schoolDistrict: values.schoolDistrict.trim() || null,
        nearbyAmenities: values.nearbyAmenities,
        agentNotes: values.agentNotes.trim() || null,
      };
      await onSubmit(input);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (key: keyof FormValues) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[key] ? "border-red-400 bg-red-50" : "border-gray-300"
    }`;

  const addTag = (
    key: "keyFeatures" | "neighborhoodHighlights" | "nearbyAmenities",
    value: string,
    setInput: (v: string) => void
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (values[key].includes(trimmed)) return;
    set(key, [...values[key], trimmed]);
    setInput("");
  };

  const removeTag = (
    key: "keyFeatures" | "neighborhoodHighlights" | "nearbyAmenities",
    index: number
  ) => {
    set(
      key,
      values[key].filter((_, i) => i !== index)
    );
  };

  const tagKeyHandler = (
    key: "keyFeatures" | "neighborhoodHighlights" | "nearbyAmenities",
    input: string,
    setInput: (v: string) => void
  ) => {
    return (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag(key, input, setInput);
      }
    };
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Location Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          Location
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={values.address}
              onChange={(e) => set("address", e.target.value)}
              className={fieldClass("address")}
              placeholder="123 Main Street"
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={values.city}
              onChange={(e) => set("city", e.target.value)}
              className={fieldClass("city")}
              placeholder="Austin"
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <select
                value={values.state}
                onChange={(e) => set("state", e.target.value)}
                className={fieldClass("state")}
              >
                <option value="">Select</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="text-red-500 text-xs mt-1">{errors.state}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={values.zip}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 5);
                  set("zip", val);
                }}
                className={fieldClass("zip")}
                placeholder="78701"
                maxLength={5}
              />
              {errors.zip && (
                <p className="text-red-500 text-xs mt-1">{errors.zip}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Property Details Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          Property Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Beds stepper */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Beds <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => set("beds", Math.max(0, values.beds - 1))}
                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-sm font-medium">
                {values.beds}
              </span>
              <button
                type="button"
                onClick={() => set("beds", values.beds + 1)}
                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Plus size={14} />
              </button>
            </div>
            {errors.beds && (
              <p className="text-red-500 text-xs mt-1">{errors.beds}</p>
            )}
          </div>

          {/* Baths stepper (0.5 increments) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Baths <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => set("baths", Math.max(0, values.baths - 0.5))}
                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-sm font-medium">
                {values.baths}
              </span>
              <button
                type="button"
                onClick={() => set("baths", values.baths + 0.5)}
                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Plus size={14} />
              </button>
            </div>
            {errors.baths && (
              <p className="text-red-500 text-xs mt-1">{errors.baths}</p>
            )}
          </div>

          {/* Sqft */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sqft <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={values.sqft}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                set("sqft", val);
              }}
              className={fieldClass("sqft")}
              placeholder="2,400"
            />
            {errors.sqft && (
              <p className="text-red-500 text-xs mt-1">{errors.sqft}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                $
              </span>
              <input
                type="text"
                value={values.priceDisplay}
                onChange={(e) => {
                  set("priceDisplay", formatDollarsDisplay(e.target.value));
                }}
                className={`${fieldClass("priceDisplay")} pl-7`}
                placeholder="450,000"
              />
            </div>
            {errors.priceDisplay && (
              <p className="text-red-500 text-xs mt-1">{errors.priceDisplay}</p>
            )}
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Type <span className="text-red-500">*</span>
            </label>
            <select
              value={values.propertyType}
              onChange={(e) =>
                set("propertyType", e.target.value as PropertyType | "")
              }
              className={fieldClass("propertyType")}
            >
              <option value="">Select</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {errors.propertyType && (
              <p className="text-red-500 text-xs mt-1">
                {errors.propertyType}
              </p>
            )}
          </div>

          {/* Year Built */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year Built
            </label>
            <input
              type="text"
              value={values.yearBuilt}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                set("yearBuilt", val);
              }}
              className={fieldClass("yearBuilt")}
              placeholder="2020"
              maxLength={4}
            />
          </div>

          {/* Lot Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lot Size
            </label>
            <input
              type="text"
              value={values.lotSize}
              onChange={(e) => set("lotSize", e.target.value)}
              className={fieldClass("lotSize")}
              placeholder="0.25 acres"
            />
          </div>

          {/* Parking */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parking
            </label>
            <input
              type="text"
              value={values.parking}
              onChange={(e) => set("parking", e.target.value)}
              className={fieldClass("parking")}
              placeholder="2-car garage"
            />
          </div>
        </div>
      </section>

      {/* Key Features (tag input) */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          Key Features <span className="text-red-500">*</span>
        </h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {values.keyFeatures.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag("keyFeatures", i)}
                className="hover:text-blue-900"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={tagKeyHandler("keyFeatures", featureInput, setFeatureInput)}
            className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.keyFeatures ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
            placeholder="Type a feature and press Enter"
          />
          <button
            type="button"
            onClick={() =>
              addTag("keyFeatures", featureInput, setFeatureInput)
            }
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            Add
          </button>
        </div>
        {errors.keyFeatures && (
          <p className="text-red-500 text-xs mt-1">{errors.keyFeatures}</p>
        )}
      </section>

      {/* Neighborhood Section */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          Neighborhood
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Neighborhood Name
            </label>
            <input
              type="text"
              value={values.neighborhood}
              onChange={(e) => set("neighborhood", e.target.value)}
              className={fieldClass("neighborhood")}
              placeholder="Downtown"
            />
          </div>

          {/* Neighborhood Highlights */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Neighborhood Highlights
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {values.neighborhoodHighlights.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-sm px-3 py-1 rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag("neighborhoodHighlights", i)}
                    className="hover:text-green-900"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyDown={tagKeyHandler(
                  "neighborhoodHighlights",
                  highlightInput,
                  setHighlightInput
                )}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type a highlight and press Enter"
              />
              <button
                type="button"
                onClick={() =>
                  addTag(
                    "neighborhoodHighlights",
                    highlightInput,
                    setHighlightInput
                  )
                }
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* School District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School District
            </label>
            <input
              type="text"
              value={values.schoolDistrict}
              onChange={(e) => set("schoolDistrict", e.target.value)}
              className={fieldClass("schoolDistrict")}
              placeholder="Austin ISD"
            />
          </div>

          {/* Nearby Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nearby Amenities
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {values.nearbyAmenities.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-sm px-3 py-1 rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag("nearbyAmenities", i)}
                    className="hover:text-purple-900"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={tagKeyHandler(
                  "nearbyAmenities",
                  amenityInput,
                  setAmenityInput
                )}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type an amenity and press Enter"
              />
              <button
                type="button"
                onClick={() =>
                  addTag("nearbyAmenities", amenityInput, setAmenityInput)
                }
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Notes */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          Agent Notes
        </h3>
        <textarea
          value={values.agentNotes}
          onChange={(e) => set("agentNotes", e.target.value)}
          className={fieldClass("agentNotes")}
          rows={4}
          placeholder="Private notes about this property (not included in generated content)..."
        />
      </section>

      {/* Submit */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
