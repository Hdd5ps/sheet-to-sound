/**
 * Help / How It Works Page
 * 
 * Educational content about:
 * - How the conversion works
 * - Supported instruments
 * - SATB playback features
 * - Best practices for sheet music uploads
 * - FAQ
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { INSTRUMENT_CATEGORIES, getInstrumentsByCategory } from '../../lib/instruments';
import { Upload, Camera, FileText, AlertCircle, Music } from 'lucide-react';

export function HelpPage() {
  const faqs = [
    {
      question: 'What file formats are supported?',
      answer: 'You can upload JPG, PNG, or PDF files. For best results, use clear, high-resolution images or scanned PDFs.',
    },
    {
      question: 'How accurate is the conversion?',
      answer: 'The conversion accuracy depends on the quality of your input. Clear, well-lit photos or high-quality scans produce the best results. Complex notation (like ornaments or non-standard symbols) may require manual verification.',
    },
    {
      question: 'Can I adjust individual voice volumes in SATB mode?',
      answer: 'Yes! In SATB mode, you can control each voice independently: mute/unmute, solo, and adjust volume from 0-100%.',
    },
    {
      question: 'What percussion instruments are available?',
      answer: 'We support a full range of orchestral percussion including pitched (timpani, xylophone, marimba) and unpitched (tambourine, tam-tam, cowbell, snare, bass drum, cymbals, and more).',
    },
    {
      question: 'Can I change the tempo after conversion?',
      answer: 'The tempo control in the playback page shows your current setting. To generate audio at a different tempo, you\'ll need to reconvert the score with the new tempo.',
    },
    {
      question: 'How long does conversion take?',
      answer: 'Most single-page scores convert in 5-15 seconds. More complex scores with multiple instruments may take longer.',
    },
  ];
  
  const uploadTips = [
    {
      icon: Camera,
      title: 'Good Lighting',
      description: 'Use natural light or bright overhead lighting. Avoid shadows or glare.',
    },
    {
      icon: FileText,
      title: 'Full Page Visible',
      description: 'Capture the entire score. Don\'t crop out important elements like clefs or key signatures.',
    },
    {
      icon: Upload,
      title: 'High Resolution',
      description: 'Use your phone\'s highest photo quality setting or scan at 300 DPI or higher.',
    },
    {
      icon: AlertCircle,
      title: 'Avoid Wrinkles',
      description: 'Flatten the page as much as possible. Wrinkles and folds can interfere with recognition.',
    },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Help & How It Works</h1>
          <p className="text-gray-600 mt-2">
            Learn how to get the best results from SheetToSound
          </p>
        </div>
        
        {/* How It Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How Sheet Music Conversion Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-700">
              <p>
                SheetToSound uses <strong>Optical Music Recognition (OMR)</strong> technology to analyze 
                your uploaded sheet music images or PDFs. Here's what happens:
              </p>
              
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li><strong>Image Analysis:</strong> We detect staff lines, note heads, stems, clefs, and other musical symbols.</li>
                <li><strong>Symbol Recognition:</strong> Each element is identified and converted to a digital music format (MusicXML/MIDI).</li>
                <li><strong>Instrument Mapping:</strong> Your selected instruments are mapped to appropriate sound fonts.</li>
                <li><strong>Audio Synthesis:</strong> The music is rendered as audio using high-quality synthesis engines.</li>
                <li><strong>Delivery:</strong> You receive playable audio (MP3) and editable MIDI files.</li>
              </ol>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-900">
                  <strong>💡 Note:</strong> This is a prototype implementation. In production, this would integrate 
                  with services like Audiveris, PhotoScore API, or custom ML models for OMR, and FluidSynth or 
                  cloud-based synthesis for audio generation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Upload Tips */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tips for Best Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uploadTips.map((tip, index) => {
                const Icon = tip.icon;
                return (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{tip.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{tip.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Supported Instruments */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Supported Instruments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {INSTRUMENT_CATEGORIES.map(category => {
                const instruments = getInstrumentsByCategory(category.id);
                
                return (
                  <div key={category.id}>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {instruments.map(inst => (
                        <span 
                          key={inst.id} 
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {inst.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* SATB Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>SATB Choir Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-700">
              <p>
                SATB (Soprano, Alto, Tenor, Bass) mode is designed for choral scores. 
                You can control each voice part independently:
              </p>
              
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Mute/Unmute:</strong> Silence or enable individual voices</li>
                <li><strong>Solo:</strong> Hear just one voice part while the others are muted</li>
                <li><strong>Volume Control:</strong> Adjust the relative balance of each voice (0-100%)</li>
                <li><strong>Full Mix:</strong> Play all enabled voices together</li>
              </ul>
              
              <p className="text-sm text-gray-600 italic">
                Perfect for learning your choir part or understanding how voices interact!
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-700">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
