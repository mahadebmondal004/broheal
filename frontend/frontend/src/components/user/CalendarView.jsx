import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Clock, X } from 'lucide-react';

const CalendarView = ({ availableSlots, onSelectSlot, onClose }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(null);

    const hasSlots = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return availableSlots?.some(slot =>
            slot.slotDate.startsWith(dateStr) && slot.status === 'available'
        );
    };

    const getTimeSlots = () => {
        const dateStr = selectedDate.toISOString().split('T')[0];
        return availableSlots?.filter(slot =>
            slot.slotDate.startsWith(dateStr) && slot.status === 'available'
        ) || [];
    };

    const handleConfirm = () => {
        if (selectedDate && selectedTime) {
            const dateTime = new Date(selectedDate);
            const [hours, minutes] = selectedTime.split(':');
            dateTime.setHours(parseInt(hours), parseInt(minutes));
            onSelectSlot(dateTime);
        }
    };

    const timeSlots = getTimeSlots();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
                    <h3 className="text-lg font-semibold">Select Date & Time</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Calendar */}
                <div className="p-4">
                    <Calendar
                        onChange={setSelectedDate}
                        value={selectedDate}
                        minDate={new Date()}
                        maxDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                        tileClassName={({ date }) => {
                            return hasSlots(date) ? 'has-slots' : '';
                        }}
                        className="w-full border-none"
                    />
                </div>

                {/* Time Slots */}
                {selectedDate && (
                    <div className="p-4 border-t">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Available Time Slots
                        </h4>
                        {timeSlots.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {timeSlots.map((slot) => (
                                    <button
                                        key={slot._id}
                                        onClick={() => setSelectedTime(slot.slotTime)}
                                        className={`py-2 px-4 rounded-lg border-2 transition-colors ${selectedTime === slot.slotTime
                                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                                : 'border-gray-200 hover:border-primary-300'
                                            }`}
                                    >
                                        {slot.slotTime}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">
                                No slots available for this date
                            </p>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 sticky bottom-0">
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedDate || !selectedTime}
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirm Booking
                    </button>
                </div>
            </div>

            <style jsx>{`
        .has-slots {
          background-color: #dbeafe !important;
          font-weight: 600;
        }
      `}</style>
        </div>
    );
};

export default CalendarView;
