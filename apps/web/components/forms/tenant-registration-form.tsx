'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  daycareName: z.string().min(2, {
    message: 'Daycare name must be at least 2 characters.',
  }),
  subdomain: z
    .string()
    .min(3, {
      message: 'Subdomain must be at least 3 characters.',
    })
    .regex(/^[a-z0-9-]+$/, {
      message: 'Subdomain can only contain lowercase letters, numbers, and hyphens.',
    }),
  address: z.string().min(5, {
    message: 'Address must be at least 5 characters.',
  }),
  phone: z.string().min(10, {
    message: 'Phone number must be at least 10 characters.',
  }),
  adminFirstName: z.string().min(2, {
    message: 'First name must be at least 2 characters.',
  }),
  adminLastName: z.string().min(2, {
    message: 'Last name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z
    .string()
    .min(8, {
      message: 'Password must be at least 8 characters.',
    })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
    }),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions.',
  }),
});

type FormData = z.infer<typeof formSchema>;

interface TenantRegistrationFormProps {
  onSuccess: (data: { subdomain: string }) => void;
}

export function TenantRegistrationForm({ onSuccess }: TenantRegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      daycareName: '',
      subdomain: '',
      address: '',
      phone: '',
      adminFirstName: '',
      adminLastName: '',
      email: '',
      password: '',
      acceptTerms: false,
    },
  });

  const checkSubdomainAvailability = async (subdomain: string) => {
    if (subdomain.length < 3) return;
    
    setCheckingSubdomain(true);
    try {
      const response = await fetch(`http://localhost:8080/api/auth/validate-subdomain?subdomain=${subdomain}`);
      const data = await response.json();
      setSubdomainAvailable(data.available);
    } catch (error) {
      console.error('Error checking subdomain:', error);
      setSubdomainAvailable(null);
    } finally {
      setCheckingSubdomain(false);
    }
  };

  const onSubmit = async (values: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/api/auth/register-tenant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Success - redirect to subdomain login
      onSuccess({ subdomain: values.subdomain });
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Daycare Information</h3>
          
          <FormField
            control={form.control}
            name="daycareName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Daycare Name</FormLabel>
                <FormControl>
                  <Input placeholder="Little Stars Daycare" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subdomain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subdomain</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Input 
                      placeholder="littlestars" 
                      {...field} 
                      className="rounded-r-none"
                      onChange={(e) => {
                        field.onChange(e);
                        if (e.target.value.length >= 3) {
                          checkSubdomainAvailability(e.target.value);
                        }
                      }}
                    />
                    <span className="inline-flex items-center px-3 text-sm text-gray-500 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 h-10">
                      .localhost:3000
                    </span>
                  </div>
                </FormControl>
                {checkingSubdomain && (
                  <p className="text-sm text-gray-500">Checking availability...</p>
                )}
                {subdomainAvailable === true && (
                  <p className="text-sm text-green-600">✓ Subdomain is available</p>
                )}
                {subdomainAvailable === false && (
                  <p className="text-sm text-red-600">✗ Subdomain is already taken</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="123 Main St, City, State 12345" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Administrator Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="adminFirstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adminLastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="admin@littlestars.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I accept the terms and conditions and privacy policy
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || subdomainAvailable === false}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}