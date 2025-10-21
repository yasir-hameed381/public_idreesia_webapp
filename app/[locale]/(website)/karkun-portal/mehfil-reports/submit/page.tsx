"use client";

import React, { useState } from "react";
import Link from "next/link";

const MehfilReportFormPage = () => {
  const [formData, setFormData] = useState({
    mehfilType: "",
    month: "",
    year: "2025",
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
    q6: "",
    q7: "",
    q8: "",
    q9: "",
    q10: "",
    q11: "",
    q12: "",
    q13: "",
    q14: "",
    q15: "",
    q16: "",
    q17: "",
    q18: "",
    meetingDetails: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    alert("رپورٹ جمع کر دی گئی ہے!");
  };

  const renderNavigationCards = () => (
    <div className="mx-auto px-6 lg:px-8 py-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-green-700 font-medium justify-center">
        <Link
          href="/karkun-portal/dashboard"
          className="px-8 py-6 rounded-lg shadow-md border border-green-200 hover:shadow-lg transition-all duration-200 hover:bg-green-50 bg-white text-black"
        >
          Dashboard
        </Link>
        <Link
          href="/karkun-portal/karkunan"
          className="px-8 py-6 rounded-lg shadow-md border border-green-200 hover:shadow-lg transition-all duration-200 hover:bg-green-50 bg-white text-black"
        >
          Karkunan
        </Link>
        <Link
          href="/karkun-portal/mehfil-reports"
          className="px-8 py-6 rounded-lg shadow-md border border-green-200 hover:shadow-lg transition-all duration-200 hover:bg-green-50 bg-green-600 text-white"
        >
          Reports
        </Link>
        <Link
          href="/karkun-portal/new-ehad"
          className="px-8 py-6 rounded-lg shadow-md border border-green-200 hover:shadow-lg transition-all duration-200 hover:bg-green-50 bg-white text-black"
        >
          New Ehad
        </Link>
        <Link
          href="/karkun-portal/tabarukats"
          className="px-8 py-6 rounded-lg shadow-md border border-green-200 hover:shadow-lg transition-all duration-200 hover:bg-green-50 bg-white text-black"
        >
          Tabarukat
        </Link>
        <Link
          href="/karkun-portal/attendance"
          className="px-8 py-6 rounded-lg shadow-md border border-green-200 hover:shadow-lg transition-all duration-200 hover:bg-green-50 bg-white text-black"
        >
          Karkunan Attendance
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {renderNavigationCards()}

        <hr className="border-gray-300 mb-6" />

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1
            className="text-3xl font-bold text-center text-gray-800 mb-8"
            style={{ direction: "rtl" }}
          >
            محفل کی رپورٹ
          </h1>

          <div className="space-y-6">
            {/* Zone and Mehfil Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-right text-gray-700 font-medium mb-2"
                  style={{ direction: "rtl" }}
                >
                  زون
                </label>
                <input
                  type="text"
                  value="ملتان زون - ملتان، پاکستان"
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-right"
                  style={{ direction: "rtl" }}
                />
              </div>

              <div>
                <label
                  className="block text-right text-gray-700 font-medium mb-2"
                  style={{ direction: "rtl" }}
                >
                  محفل کی قسم
                </label>
                <select
                  name="mehfilType"
                  value={formData.mehfilType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right"
                  style={{ direction: "rtl" }}
                >
                  <option value="">محفل منتخب کریں</option>
                  <option value="weekly">ہفتہ وار محفل</option>
                  <option value="monthly">ماہانہ محفل</option>
                  <option value="special">خصوصی محفل</option>
                </select>
              </div>
            </div>

            {/* Month and Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-right text-gray-700 font-medium mb-2"
                  style={{ direction: "rtl" }}
                >
                  مہینہ
                </label>
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right"
                  style={{ direction: "rtl" }}
                >
                  <option value="">منتخب کریں</option>
                  <option value="january">جنوری</option>
                  <option value="february">فروری</option>
                  <option value="march">مارچ</option>
                  <option value="april">اپریل</option>
                  <option value="may">مئی</option>
                  <option value="june">جون</option>
                  <option value="july">جولائی</option>
                  <option value="august">اگست</option>
                  <option value="september">ستمبر</option>
                  <option value="october">اکتوبر</option>
                  <option value="november">نومبر</option>
                  <option value="december">دسمبر</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-right text-gray-700 font-medium mb-2"
                  style={{ direction: "rtl" }}
                >
                  سال
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right"
                  style={{ direction: "rtl" }}
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
            </div>

            {/* Main Questions Section */}
            <div className="space-y-4 mt-8">
              <h2
                className="text-xl font-bold text-gray-800 text-right mb-4"
                style={{ direction: "rtl" }}
              >
                محفل کی تفصیلات
              </h2>

              {/* Questions 1-9 */}
              {[
                { num: "1", label: "محفل کیوں نہیں کی گئی" },
                {
                  num: "2",
                  label: "محفل کیوں نہیں کی گئی (ماہانہ خدماتی تربیتی)",
                },
                { num: "3", label: "محفل میں لوگوں کی پہلی جماعت کی تعداد" },
                { num: "4", label: "ضروری کام کی ماہانہ پہلی جماعت کی تعداد" },
                { num: "5", label: "مقامیہ کے غیر کارکنان کی تعداد" },
                { num: "6", label: "غیر کارکنان کی ماہانہ خدمات (دن)" },
                { num: "7", label: "اگلے مہینے میں ایران میں کام کی نئی مہد" },
                { num: "8", label: "اس مہینے میں محفل کی نئی ہوئی" },
                {
                  num: "9",
                  label: "مطلبی تقریب کی فہم کیوں پہلی جماعت کی تعداد",
                },
              ].map((item) => (
                <div key={item.num}>
                  <label
                    className="block text-right text-gray-700 mb-2"
                    style={{ direction: "rtl" }}
                  >
                    <span className="font-semibold">{"0" + item.num}</span>{" "}
                    {item.label}
                  </label>
                  <input
                    type="text"
                    name={`q${item.num}`}
                    value={formData[`q${item.num}`]}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    style={{ direction: "rtl" }}
                  />
                </div>
              ))}

              {/* Radio Button Questions 10-11 */}
              <div className="space-y-4 mt-6">
                <div>
                  <label
                    className="block text-right text-gray-700 mb-2"
                    style={{ direction: "rtl" }}
                  >
                    <span className="font-semibold">10</span> محفل دوران سے نماز
                    کی تعلیمات کی رویسہ رکھیں تھیں؟
                  </label>
                  <div className="flex gap-4 justify-end">
                    <label className="flex items-center cursor-pointer">
                      <span className="mr-2" style={{ direction: "rtl" }}>
                        نہیں
                      </span>
                      <input
                        type="radio"
                        name="q10"
                        value="no"
                        onChange={handleChange}
                        className="ml-2 w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <span className="mr-2" style={{ direction: "rtl" }}>
                        ہاں
                      </span>
                      <input
                        type="radio"
                        name="q10"
                        value="yes"
                        onChange={handleChange}
                        className="ml-2 w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label
                    className="block text-right text-gray-700 mb-2"
                    style={{ direction: "rtl" }}
                  >
                    <span className="font-semibold">11</span> محفل میں شامی
                    سوجاری میں پورنہان باس سے؟
                  </label>
                  <div className="flex gap-4 justify-end">
                    <label className="flex items-center cursor-pointer">
                      <span className="mr-2" style={{ direction: "rtl" }}>
                        نہیں
                      </span>
                      <input
                        type="radio"
                        name="q11"
                        value="no"
                        onChange={handleChange}
                        className="ml-2 w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <span className="mr-2" style={{ direction: "rtl" }}>
                        ہاں
                      </span>
                      <input
                        type="radio"
                        name="q11"
                        value="yes"
                        onChange={handleChange}
                        className="ml-2 w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Questions 12-15 Section */}
              <div className="bg-gray-50 p-6 rounded-lg mt-6 border border-gray-200">
                <h3
                  className="text-lg font-bold text-gray-800 text-right mb-4"
                  style={{ direction: "rtl" }}
                >
                  محفل مہ تبادرہ کی تفصیل
                </h3>

                {[
                  { num: "12", label: "محفل میں پورنہان، پہلوس کی تعداد" },
                  { num: "13", label: "ماہانہ آباد پہلوس کی تعداد" },
                  { num: "14", label: "دسواں میں شریک ہونے والوں کی تعداد" },
                  { num: "15", label: "اگر کارکنان میں شریک کی تعداد" },
                ].map((item) => (
                  <div key={item.num} className="mb-4">
                    <label
                      className="block text-right text-gray-700 mb-2"
                      style={{ direction: "rtl" }}
                    >
                      <span className="font-semibold">{item.num}</span>{" "}
                      {item.label}
                    </label>
                    <input
                      type="text"
                      name={`q${item.num}`}
                      value={formData[`q${item.num}`]}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      style={{ direction: "rtl" }}
                    />
                  </div>
                ))}
              </div>

              {/* Questions 16-18 Section */}
              <div className="bg-gray-50 p-6 rounded-lg mt-6 border border-gray-200">
                <h3
                  className="text-lg font-bold text-gray-800 text-right mb-4"
                  style={{ direction: "rtl" }}
                >
                  ماہانہ میشورت میں شریک کی تفصیل
                </h3>

                <div className="mb-4">
                  <label
                    className="block text-right text-gray-700 mb-2"
                    style={{ direction: "rtl" }}
                  >
                    <span className="font-semibold">16</span> میشورت کی تاریخ
                  </label>
                  <input
                    type="date"
                    name="q16"
                    value={formData.q16}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-right text-gray-700 mb-2"
                    style={{ direction: "rtl" }}
                  >
                    <span className="font-semibold">17</span> میشورت میں شامل
                    پہلی جماعت کی تعداد
                  </label>
                  <input
                    type="text"
                    name="q17"
                    value={formData.q17}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    style={{ direction: "rtl" }}
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-right text-gray-700 mb-2"
                    style={{ direction: "rtl" }}
                  >
                    <span className="font-semibold">18</span> دنیا واپر غیر
                    کارکنان
                  </label>
                  <select
                    name="q18"
                    value={formData.q18}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    style={{ direction: "rtl" }}
                  >
                    <option value="">غیر کارکنان، منتخب کریں</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                  </select>
                </div>
              </div>

              {/* Meeting Details Textarea */}
              <div className="bg-gray-50 p-6 rounded-lg mt-6 border border-gray-200">
                <h3
                  className="text-lg font-bold text-gray-800 text-right mb-4"
                  style={{ direction: "rtl" }}
                >
                  ماہانہ میشورت میں شریک کی تفصیلات
                </h3>
                <textarea
                  name="meetingDetails"
                  value={formData.meetingDetails}
                  onChange={handleChange}
                  rows={6}
                  placeholder="ماہانہ، میشورت، میں شریک کی تفصیلات، پیرن، اگلیاں"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-right bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  style={{ direction: "rtl" }}
                ></textarea>
              </div>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="flex justify-center gap-4 mt-8">
              <Link href="/karkun-portal/mehfil-reports">
                <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition duration-200 shadow-md">
                  منسوخ کریں
                </button>
              </Link>
              <button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200 shadow-md"
              >
                رپورٹ جمع کریں
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MehfilReportFormPage;
