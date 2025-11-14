import React from "react";
import { Khat } from "@/types/khat";

interface KhatDetailViewProps {
  khat: Khat | null;
  actionsSlot?: React.ReactNode;
}

interface InfoRowProps {
  label: string;
  value?: React.ReactNode;
  fullWidth?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value = "—", fullWidth }) => (
  <div className={`${fullWidth ? "col-span-2" : "flex flex-col gap-1"}`}>
    <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-900 break-words">{value || "—"}</span>
  </div>
);

const InfoSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
  </div>
);

const formatBoolean = (value?: boolean | null) => {
  if (value === null || value === undefined) return "—";
  return value ? "Yes" : "No";
};

const formatList = (list?: string[] | null) => {
  if (!list || list.length === 0) return "—";
  return list.join(", ");
};

const formatNumber = (value?: number | null) => {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString();
};

const KhatDetailView: React.FC<KhatDetailViewProps> = ({ khat, actionsSlot }) => {
  return (
    <div className="space-y-6">
      {actionsSlot && <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">{actionsSlot}</div>}

      <InfoSection title="Applicant Details">
        <InfoRow label="Full Name" value={khat?.full_name} />
        <InfoRow label="Father Name" value={khat?.father_name} />
        <InfoRow label="Phone Number" value={khat?.phone_number} />
        <InfoRow label="Email" value={khat?.email} />
        <InfoRow
          label="Zone"
          value={
            khat?.zone
              ? `${khat.zone.title_en}${khat.zone.city_en ? ` - ${khat.zone.city_en}` : ""}`
              : "—"
          }
        />
        <InfoRow
          label="Mehfil"
          value={
            khat?.mehfilDirectory
              ? `#${khat.mehfilDirectory.mehfil_number} - ${khat.mehfilDirectory.name_en}`
              : "—"
          }
        />
        <InfoRow label="City" value={khat?.city} />
        <InfoRow label="Address" value={khat?.address} />
        <InfoRow label="Introducer" value={khat?.introducer_name} />
        <InfoRow label="Ehad Duration" value={khat?.ehad_duration} />
        <InfoRow label="Last Tarteeb" value={khat?.last_tarteeb} />
        <InfoRow label="Age" value={formatNumber(khat?.age)} />
      </InfoSection>

      <InfoSection title="Wazaif Practice">
        <InfoRow label="Consistent in Wazaif" value={formatBoolean(khat?.consistent_in_wazaif)} />
        <InfoRow label="Consistent in Prayers" value={formatBoolean(khat?.consistent_in_prayers)} />
        <InfoRow label="Consistent in Ishraq" value={formatBoolean(khat?.consistent_in_ishraq)} />
        <InfoRow label="Makes up Missed Prayers" value={formatBoolean(khat?.makes_up_missed_prayers)} />
        <InfoRow label="Missed Prayers" value={formatList(khat?.missed_prayers)} />
        <InfoRow label="Can Read Quran" value={formatBoolean(khat?.can_read_quran)} />
        <InfoRow label="Multan Visit Frequency" value={khat?.multan_visit_frequency} />
        <InfoRow label="Mehfil Attendance Frequency" value={khat?.mehfil_attendance_frequency} />
        <InfoRow label="Submitted Before" value={formatBoolean(khat?.is_submitted_before)} />
        <InfoRow label="Last Submission Wazaifs" value={khat?.last_submission_wazaifs} />
        <InfoRow label="Additional Wazaif Reading" value={khat?.additional_wazaif_reading} />
        <InfoRow label="Description" value={khat?.description} fullWidth />
      </InfoSection>

      <InfoSection title="Wazaif Quantities">
        <InfoRow label="Kalimah" value={formatNumber(khat?.kalimah_quantity)} />
        <InfoRow label="Allah" value={formatNumber(khat?.allah_quantity)} />
        <InfoRow label="Laa Ilaaha Illallah" value={formatNumber(khat?.laa_ilaaha_illallah_quantity)} />
        <InfoRow label="Sallallahu Alayhi Wasallam" value={formatNumber(khat?.sallallahu_alayhi_wasallam_quantity)} />
        <InfoRow label="Astagfirullah" value={formatNumber(khat?.astagfirullah_quantity)} />
        <InfoRow label="Ayat ul Kursi" value={formatNumber(khat?.ayat_ul_kursi_quantity)} />
        <InfoRow label="Dua e Talluq" value={formatNumber(khat?.dua_e_talluq_quantity)} />
        <InfoRow label="Dua e Waswasey" value={formatNumber(khat?.dua_e_waswasey_quantity)} />
      </InfoSection>

      <InfoSection title="Reciter Details">
        <InfoRow label="Relation" value={khat?.reciter_relation} />
        <InfoRow label="Name" value={khat?.reciter_name} />
        <InfoRow label="Age" value={formatNumber(khat?.reciter_age)} />
        <InfoRow label="Ehad Duration" value={khat?.reciter_ehad_duration} />
        <InfoRow label="Consistent in Wazaif" value={formatBoolean(khat?.reciter_consistent_in_wazaif)} />
        <InfoRow label="Consistent in Prayers" value={formatBoolean(khat?.reciter_consistent_in_prayers)} />
        <InfoRow label="Makes up Missed Prayers" value={formatBoolean(khat?.reciter_makes_up_missed_prayers)} />
        <InfoRow label="Missed Prayers" value={formatList(khat?.reciter_missed_prayers)} />
        <InfoRow label="Can Read Quran" value={formatBoolean(khat?.reciter_can_read_quran)} />
        <InfoRow label="Multan Visit Frequency" value={khat?.reciter_multan_visit_frequency} />
        <InfoRow label="Mehfil Attendance Frequency" value={khat?.reciter_mehfil_attendance_frequency} />
      </InfoSection>
    </div>
  );
};

export default KhatDetailView;


