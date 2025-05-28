import React, { useState, useEffect } from 'react'
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"

export default function WhatIsNextContent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Check if any field is filled to enable the submit button
  useEffect(() => {
    const hasValue = Object.values(formData).some(value => value.trim() !== '');
    setIsFormValid(hasValue);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real app, this would send an email to mariam.morozova@gmail.com
      // Simulating email submission
      console.log(`Sending feedback to mariam.morozova@gmail.com:
        From: ${formData.name} (${formData.email})
        Message: ${formData.message}
      `);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      
      // Reset success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto bg-gray-50 font-istok">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 md:p-8 my-4 sm:my-6">
        <h1 className="text-[24px] font-bold mb-6 sm:mb-8 flex items-center">
          <span className="mr-2 text-xl sm:text-2xl">🌱</span> What is coming next
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Feature 1 */}
          <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center mb-3">
              <span className="text-xl mr-2">🔌</span>
              <h2 className="text-lg font-semibold">Integrations</h2>
            </div>
            <p className="text-[14px] text-gray-800">
              Integration with other analytic tools or your software
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center mb-3">
              <span className="text-xl mr-2">✨</span>
              <h2 className="text-lg font-semibold">Suggest Improvements</h2>
            </div>
            <p className="text-[14px] text-gray-800">
              More insight based on your requested data type
            </p>
          </div>
          
          {/* Feature 3 */}
          <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center mb-3">
              <span className="text-xl mr-2">✏️</span>
              <h2 className="text-lg font-semibold">Create an A/B Test</h2>
            </div>
            <p className="text-[14px] text-gray-800">
              Advanced A/B test plan.
            </p>
          </div>
          
          {/* Feature 4 */}
          <div className="p-4 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center mb-3">
              <span className="text-xl mr-2">📊</span>
              <h2 className="text-lg font-semibold">Simulate data</h2>
            </div>
            <p className="text-[14px] text-gray-800">
              Predictions on how you can Improve customer UX and grow your Business
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6 mb-6">
          <p className="text-[14px] text-gray-800 mb-6">
            Wanna tell us how Hoot.ai can help you? Fill out the form below ❤️
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 shadow-sm text-sm sm:text-base">
              Thank you for your feedback! We&apos;ll get back to you soon.
            </div>
          )}
          
          <div>
            <label htmlFor="name" className="block text-base sm:text-lg font-medium mb-1.5 sm:mb-2 text-gray-700">Name</label>
            <Input 
              id="name" 
              placeholder="Enter your name here" 
              className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-base sm:text-lg font-medium mb-1.5 sm:mb-2 text-gray-700">Email</label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Enter your email here" 
              className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-base sm:text-lg font-medium mb-1.5 sm:mb-2 text-gray-700">Message</label>
            <Textarea 
              id="message" 
              placeholder="Enter your message here" 
              className="w-full p-2 sm:p-3 text-sm sm:text-base min-h-24 sm:min-h-32 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>
          
          <input type="hidden" name="recipient" value="mariam.morozova@gmail.com" />
          <div style={{maxWidth: '50%', margin: '3em auto'}}>
          <Button 
            type="submit" 
            variant="outline"
            className="w-full text-indigo-600 border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-600"
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? 'Sending...' : 'Send your message'}
          </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 