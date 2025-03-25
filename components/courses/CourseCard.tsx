import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle2 } from "lucide-react";
import supabase from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import PaymentModal from "../payment/PaymentModal";
import { formatPrice } from "@/utils/razorpay";

interface CourseCardProps {
  id: string;
  title: string;
  desc: string;
  image_url?: string;
  instructor?: string;
  isEnrolled?: boolean;
  price?: number;
  is_free?: boolean;
  currency?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  desc,
  image_url,
  instructor,
  isEnrolled = false,
  price = 0,
  is_free = true,
  currency = "INR"
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [localIsEnrolled, setIsEnrolled] = useState(isEnrolled);
  
  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleEnroll = async () => {
    // If it's a paid course and not enrolled, show payment modal
    if (!localIsEnrolled && !is_free) {
      setShowPaymentModal(true);
      return;
    }
    
    // For free courses, use direct enrollment
    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { error } = await supabase
        .from("user_data")
        .insert({
          user_id: user.id,
          course_id: id,
        });

      if (error) throw error;

      // Show the success message
      setEnrollSuccess(true);
      // Hide after 3 seconds
      setTimeout(() => {
        setEnrollSuccess(false);
      }, 3000);

      // Update local state
      setIsEnrolled(true);
    } catch (error) {
      console.error("Error enrolling in course:", error);
      toast({
        title: "Enrollment Failed",
        description: "There was an error enrolling in this course.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image_url || "https://placehold.co/600x400"}
          alt={title}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
        />
        {instructor && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-2 text-sm">
            <span className="font-medium">Instructor: {instructor}</span>
          </div>
        )}
        
        {/* Enrollment badge */}
        {localIsEnrolled && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
            Enrolled
          </div>
        )}
      </div>
      
      <CardContent className="flex-grow p-5">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{desc}</p>
        
        {/* Price display */}
        <div className="mt-2 mb-3">
          {is_free ? (
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
              Free Course
            </span>
          ) : (
            <div className="flex items-baseline">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(price, currency)}
              </span>
              <span className="ml-1 text-sm text-gray-500">
                {currency}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-5 pt-0 mt-auto">
        {!localIsEnrolled ? (
          <Button 
            onClick={handleEnroll} 
            disabled={isLoading}
            variant="default"
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {is_free ? "Enroll for Free" : "Buy Course"}
          </Button>
        ) : (
          <Link href={`/Courses/${id}`} className="w-full">
            <Button variant="outline" className="w-full">
              Continue Learning
            </Button>
          </Link>
        )}
      </CardFooter>
      
      {/* Success message */}
      {enrollSuccess && (
        <div className="absolute bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-10 animate-in fade-in">
          <div className="flex">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-sm">Successfully enrolled in course!</p>
          </div>
        </div>
      )}
      
      {/* Payment success message */}
      {paymentSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 animate-in slide-in-from-right">
          <div className="flex">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-sm font-medium">
              Payment successful! You're now enrolled in the course.
            </p>
          </div>
        </div>
      )}
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          courseId={id}
          courseTitle={title}
          price={price || 0}
          currency={currency || 'INR'}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setPaymentSuccess(true);
            setShowPaymentModal(false);
            setIsEnrolled(true);
            setTimeout(() => setPaymentSuccess(false), 5000);
          }}
        />
      )}
    </Card>
  );
};

export default CourseCard;
