"use client";
import { useForm, Controller } from "react-hook-form";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { classNames } from "primereact/utils";
import { useCreateNamazMutation } from "@/store/slicers/NamazApi";
import { useToast } from "@/hooks/useToast";

interface NamazFormProps {
  open: boolean;
  onClose: () => void;
}

type FormData = {
  namaz_name: string;
  namaz_time: string;
};

// Define the available Namaz options
const NAMAZ_OPTIONS = [
  { label: "Fajr", value: "Fajr" },
  { label: "Sunrise", value: "Sunrise" },
  { label: "Ishraq", value: "Ishraq" },
  { label: "Dhuhr", value: "Dhuhr" },
  { label: "Asr", value: "Asr" },
  { label: "Magrib", value: "Magrib" },
  { label: "Isha", value: "Isha" },
];

export function Namazform({ open, onClose }: NamazFormProps) {
  const { showError, showSuccess } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      namaz_name: "",
      namaz_time: "",
    },
  });

  const [createNamaz, { isLoading: isCreating }] = useCreateNamazMutation();

  const onSubmit = async (data: FormData) => {
    try {
      const [hourStr, minuteStr] = data.namaz_time.split(":");
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      const now = new Date();
      // Create a Date object that represents the current date but with
      // the selected time components treated as UTC.
      const utcDate = new Date(
        Date.UTC(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hour,
          minute,
          0,
          0
        )
      );

      const isoTime = utcDate.toISOString(); // This will now correctly represent the selected time in UTC

      // Map the namaz_name to the appropriate field in the Namaz interface
      const namazData = {
        fajr: data.namaz_name === "Fajr" ? isoTime : "",
        dhuhr: data.namaz_name === "Dhuhr" ? isoTime : "",
        jumma: data.namaz_name === "Jumma" ? isoTime : "",
        asr: data.namaz_name === "Asr" ? isoTime : "",
        maghrib: data.namaz_name === "Magrib" ? isoTime : "",
        isha: data.namaz_name === "Isha" ? isoTime : "",
        description_en: null,
        description_ur: null,
      };

      await createNamaz(namazData).unwrap();

      showSuccess("Namaz time added successfully");
      reset();
      onClose();
    } catch (error: any) {
      console.error("Error:", error);
      showError(error?.data?.message || "Failed to add namaz time");
    }
  };

  const getFormErrorMessage = (name: keyof FormData) => {
    return errors[name] ? (
      <small className="p-error">{errors[name]?.message}</small>
    ) : null;
  };

  const renderFooter = () => {
    return (
      <div className="flex justify-end gap-2 pt-4">
        <Button
          label="Cancel"
          icon="pi pi-times"
          onClick={() => onClose()}
          className="p-button-text border p-2"
        />
        <Button
          label="Create"
          icon="pi pi-check"
          onClick={handleSubmit(onSubmit)}
          loading={isCreating}
          className="p-button-text border p-2"
        />
      </div>
    );
  };

  return (
    <>
      <Dialog
        header="Add New Namaz Time"
        visible={open}
        style={{ width: "450px" }}
        modal
        onHide={() => onClose()}
        footer={renderFooter()}
        dismissableMask
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
          {/* Namaz Name Dropdown */}
          <div className="field">
            <label htmlFor="namaz_name" className="block mb-2">
              Namaz Name*
            </label>
            <Controller
              name="namaz_name"
              control={control}
              rules={{ required: "Namaz Name is required" }}
              render={({ field, fieldState }) => (
                <Dropdown
                  id={field.name}
                  value={field.value}
                  options={NAMAZ_OPTIONS}
                  onChange={(e) => field.onChange(e.value)}
                  placeholder="Select a Namaz"
                  className={classNames("w-full border  h-11", {
                    "p-invalid": fieldState.error,
                  })}
                />
              )}
            />
            {getFormErrorMessage("namaz_name")}
          </div>

          {/* Namaz Time */}
          <div className="field">
            <label htmlFor="namaz_time" className="block mb-2">
              Namaz Time*
            </label>
            <Controller
              name="namaz_time"
              control={control}
              rules={{ required: "Time is required" }}
              render={({ field, fieldState }) => (
                <InputText
                  id={field.name}
                  type="time"
                  {...field}
                  className={classNames("w-full border p-2", {
                    "p-invalid": fieldState.error,
                  })}
                />
              )}
            />
            {getFormErrorMessage("namaz_time")}
          </div>
        </form>
      </Dialog>
    </>
  );
}
