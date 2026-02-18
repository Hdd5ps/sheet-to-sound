/**
 * Home Page
 * 
 * Landing page with:
 * - Value proposition
 * - Feature highlights
 * - Call-to-action
 * - How it works section
 */

import React from 'react';
import { Link } from 'react-router';
import { Music, Upload, Sliders, Play, Download, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../contexts/auth-context';

export function HomePage() {
  const { user } = useAuth();
  
  const features = [
    {
      icon: Upload,
      title: 'Upload or Photograph',
      description: 'Upload sheet music images or PDFs. Works with phone photos or scanned documents.',
    },
    {
      icon: Sliders,
      title: 'Choose Instruments',
      description: 'Select from a full orchestral palette including strings, brass, woodwinds, percussion (tambourine, tam-tam, cowbell), and SATB choir voices.',
    },
    {
      icon: Play,
      title: 'Play & Practice',
      description: 'Hear exactly how your music should sound. Control tempo, loop sections, solo voices, and more.',
    },
    {
      icon: Download,
      title: 'Download Files',
      description: 'Export audio (MP3) and MIDI files for use in other music software or personal practice.',
    },
  ];
  
  const steps = [
    { number: 1, title: 'Upload', text: 'Take a photo or upload a PDF of your sheet music' },
    { number: 2, title: 'Select', text: 'Choose instruments or SATB choir configuration' },
    { number: 3, title: 'Convert', text: 'Our system analyzes and converts the notation' },
    { number: 4, title: 'Play', text: 'Listen, adjust tempo, and download your audio' },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-600 text-white">
            <Music className="w-10 h-10" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Turn Sheet Music<br />Into Beautiful Sound
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Convert any sheet music score into accurate, playable audio with your choice of instruments or full SATB choir. 
          Perfect for music learners, performers, and educators.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={user ? '/upload' : '/signup'}>
            <Button variant="primary" size="lg" className="px-8">
              {user ? 'Convert Sheet Music' : 'Get Started Free'}
            </Button>
          </Link>
          
          <Link to="/help">
            <Button variant="outline" size="lg" className="px-8">
              Learn How It Works
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything You Need
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} variant="elevated">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      
      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {step.text}
                  </p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-blue-200 -ml-4" 
                       style={{ width: 'calc(100% - 4rem)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Card variant="elevated" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-12">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Bring Your Sheet Music to Life?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join music learners and performers using SheetToSound to master their repertoire.
            </p>
            <Link to={user ? '/upload' : '/signup'}>
              <Button variant="secondary" size="lg" className="px-8 bg-white text-blue-600 hover:bg-gray-100">
                Start Converting Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
