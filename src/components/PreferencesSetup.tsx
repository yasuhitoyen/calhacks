import { serviceOptions } from '@/constants/Constants.js';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

/* ---------- Types ---------- */
interface PreferencesSetupProps {
  onComplete: (preferences: UserPreferences) => void;
  onBack: () => void;
}

export interface UserPreferences {
  /**
   * ZIP code is now used instead of precise location
   */
  zipCode: string;
  serviceTypes: string[];
  languagePreference: string;
  accessibilityNeeds: string[];
  familySize: string;
  specialRequirements: string[];
  notificationPreference: string;
}

/* ---------- Component ---------- */
const PreferencesSetup = ({ onComplete, onBack }: PreferencesSetupProps) => {
  /* ----- State ----- */
  const [preferences, setPreferences] = useState<{
    zipCode: string;
    serviceTypes: string[];
    languagePreference: string;
    accessibilityNeeds: string[];
    familySize: string;
    specialRequirements: string[];
    notificationPreference: string;
  }>({
    zipCode: '',
    serviceTypes: [],
    languagePreference: 'english',
    accessibilityNeeds: [],
    familySize: 'individual',
    specialRequirements: [],
    notificationPreference: 'none',
  });

  /* Toggle a service chip */
  const handleServiceToggle = (serviceId: string) =>
    setPreferences(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(serviceId)
        ? prev.serviceTypes.filter(id => id !== serviceId)
        : [...prev.serviceTypes, serviceId],
    }));

  // Check if we can proceed (need zip and at least one service)
  const canProceed = preferences.zipCode.trim().length === 5 &&
                     preferences.serviceTypes.length > 0;

  const handleComplete = () => {
    if (canProceed) {
      onComplete({
        zipCode: preferences.zipCode,
        serviceTypes: preferences.serviceTypes,
        languagePreference: preferences.languagePreference,
        accessibilityNeeds: preferences.accessibilityNeeds,
        familySize: preferences.familySize,
        specialRequirements: preferences.specialRequirements,
        notificationPreference: preferences.notificationPreference,
      });
    }
  };

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">

      <div>
        <h1>{ preferences.zipCode }</h1>
        <h1>{ preferences.serviceTypes[0] }</h1>
        <h1>{ preferences.serviceTypes[1] }</h1>
        <h1>{ preferences.serviceTypes[2] }</h1>
        <h1>{ preferences.serviceTypes[3] }</h1>
        <h1>{ preferences.serviceTypes[4] }</h1>
        <h1>{ preferences.serviceTypes[5] }</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>

        {/* Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Choose services & enter ZIP code</CardTitle>
            <CardDescription>
              Select services you need and enter your ZIP code to find nearby resources.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* ZIP Code Input */}
            <div className="p-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50">
              <div className="text-center space-y-3">
                <h3 className="font-semibold text-blue-900">ZIP Code Required</h3>
                <p className="text-sm text-blue-700">
                  Enter your ZIP code so we can find the closest resources and services in your area.
                </p>
                <Input
                  type="text"
                  maxLength={5}
                  value={preferences.zipCode}
                  onChange={e => setPreferences(prev => ({ ...prev, zipCode: e.target.value }))}
                  placeholder="Enter ZIP code"
                  className="max-w-xs mx-auto text-center"
                />
              </div>
            </div>

            {/* Services grid */}
            <div>
              <h3 className="font-semibold mb-3">What services do you need?</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {serviceOptions.map(service => (
                  <Card
                    key={service.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      preferences.serviceTypes.includes(service.id)
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleServiceToggle(service.id)}
                  >
                    <CardContent className="p-4 flex items-start space-x-3">
                      <div className="text-2xl">{service.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{service.label}</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {service.description}
                        </p>
                      </div>
                      <Checkbox
                        checked={preferences.serviceTypes.includes(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleComplete}
            disabled={!canProceed}
            className="flex items-center space-x-2"
          >
            <span>Find Resources</span>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {!canProceed && (
          <p className="text-center text-sm text-gray-500 mt-3">
            Please enter your ZIP code and select at least one service to continue
          </p>
        )}
      </div>
    </div>
  );
};

export default PreferencesSetup;
