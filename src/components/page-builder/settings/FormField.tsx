import React from "react";

interface FormFieldProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

export function FormField({ label, description, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      {children}
    </div>
  );
}

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "url" | "number";
}

export function TextInput({ value, onChange, placeholder, type = "text" }: TextInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
    />
  );
}

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function TextArea({ value, onChange, placeholder, rows = 4 }: TextAreaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
    />
  );
}

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded cursor-pointer border-0"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder="#000000"
      />
    </div>
  );
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function Select({ value, onChange, options }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export function Slider({ value, onChange, min = 0, max = 100, step = 1, unit = "" }: SliderProps) {
  return (
    <div className="flex items-center gap-4">
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="flex-1"
      />
      <span className="text-sm font-medium text-gray-700 w-16 text-right">
        {value}{unit}
      </span>
    </div>
  );
}

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}

export function Toggle({ value, onChange, label }: ToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? "bg-primary-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </div>
  );
}

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  return (
    <div className="space-y-2">
      {value && (
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <img src={value} alt="Preview" className="w-full h-full object-cover" loading="lazy" />
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter image URL"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer">
          Upload
          <input type="file" accept="image/*" className="hidden" />
        </label>
      </div>
    </div>
  );
}

interface ButtonConfigProps {
  value: { text: string; link?: string; bgColor?: string; textColor?: string };
  onChange: (value: any) => void;
  index: number;
}

export function ButtonConfig({ value, onChange, index }: ButtonConfigProps) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">Button {index + 1}</span>
        <button
          onClick={() => onChange(null)}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          Remove
        </button>
      </div>
      <TextInput
        value={value.text}
        onChange={(text) => onChange({ ...value, text })}
        placeholder="Button text"
      />
      <TextInput
        value={value.link || ""}
        onChange={(link) => onChange({ ...value, link })}
        placeholder="Button link"
        type="url"
      />
      <div className="grid grid-cols-2 gap-2">
        <ColorPicker
          value={value.bgColor || "#000000"}
          onChange={(bgColor) => onChange({ ...value, bgColor })}
        />
        <ColorPicker
          value={value.textColor || "#FFFFFF"}
          onChange={(textColor) => onChange({ ...value, textColor })}
        />
      </div>
    </div>
  );
}
